
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking, Room } from '@/lib/types';


/**
 * Razorpay Webhook Handler
 * 
 * This serverless function listens for payment success events from Razorpay.
 * It is responsible for:
 * 1. Verifying the authenticity of the webhook request.
 * 2. Updating the booking status from PENDING to CONFIRMED in Firestore.
 * 3. Atomically decrementing the available room count for the booked room.
 * This is the single source of truth for booking confirmation.
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const { adminDb, error: adminError } = getFirebaseAdmin();
  if (adminError || !adminDb) {
    console.error('Firebase Admin SDK failed to initialize:', adminError);
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const text = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // STEP 1: Verify the webhook signature
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(text);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.warn('Invalid Razorpay webhook signature received.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log("✅ Razorpay webhook signature verified.");

    const event = JSON.parse(text);

    // STEP 2: Listen for the 'payment.captured' event
    if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        const bookingId = payment.notes?.booking_id;
        const userId = payment.notes?.user_id;

        if (!bookingId || !userId) {
            console.error('Webhook Error: booking_id or user_id missing in payment notes.', payment.notes);
            return NextResponse.json({ error: 'Missing required notes in payment.' }, { status: 400 });
        }
        
        console.log(`Processing confirmation for Booking ID: ${bookingId}, User ID: ${userId}`);

        // STEP 3: Run a Firestore transaction to confirm booking & update inventory
        const bookingRef = adminDb.collection('users').doc(userId).collection('bookings').doc(bookingId);

        await adminDb.runTransaction(async (transaction) => {
            const bookingDoc = await transaction.get(bookingRef);
            
            if (!bookingDoc.exists) {
                console.error(`Webhook Aborted: Booking document not found at path: ${bookingRef.path}`);
                // Acknowledge the webhook but log error. Maybe it was a test or already deleted.
                return;
            }
            
            const bookingData = bookingDoc.data() as Booking;

            // Idempotency Check: If already confirmed, do nothing.
            if (bookingData.status === 'CONFIRMED') {
                console.log(`Webhook Ignored: Booking ${bookingId} is already confirmed.`);
                return;
            }
            if (bookingData.status !== 'PENDING') {
                 console.warn(`Webhook Ignored: Booking ${bookingId} is not in PENDING state (current: ${bookingData.status}).`);
                 return;
            }

            const { hotelId, roomId } = bookingData;
            const roomRef = adminDb.collection('hotels').doc(hotelId).collection('rooms').doc(roomId);
            const roomDoc = await transaction.get(roomRef);

            if (!roomDoc.exists) {
                 console.error(`Webhook Critical Error: Room document not found for booking ${bookingId} at path: ${roomRef.path}. Cannot update inventory.`);
                 // Still confirm the booking so the user isn't left hanging, but log a critical error for admin.
                 transaction.update(bookingRef, {
                    status: 'CONFIRMED',
                    razorpayPaymentId: payment.id,
                 });
                 return;
            }

            const roomData = roomDoc.data() as Room;
            const newAvailableRooms = (roomData.availableRooms ?? 0) - 1;

            if (newAvailableRooms < 0) {
                console.warn(`Webhook Warning: Overbooking detected for room ${roomId} on booking ${bookingId}. Setting available rooms to 0.`);
            }
            
            // Perform the updates
            console.log(`Updating Booking ${bookingId} to CONFIRMED.`);
            transaction.update(bookingRef, {
                status: 'CONFIRMED',
                razorpayPaymentId: payment.id,
            });

            console.log(`Decrementing inventory for Room ${roomId}. New count: ${newAvailableRooms >= 0 ? newAvailableRooms : 0}`);
            transaction.update(roomRef, {
                availableRooms: Math.max(0, newAvailableRooms)
            });
        });

        console.log(`✅ Successfully confirmed booking ${bookingId}.`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
