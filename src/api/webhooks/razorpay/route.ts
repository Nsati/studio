
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import getRawBody from 'raw-body';
import { adminDb } from '@/firebase/admin';
import type { Booking, Hotel, Room } from '@/lib/types';
import * as admin from 'firebase-admin';

// Disable Next.js body parser to access the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) {
    console.error('CRITICAL: RAZORPAY_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  try {
    const rawBody = await getRawBody(req.body!);
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const body = JSON.parse(rawBody.toString());
    const event = body.event;

    if (event === 'payment.captured') {
        const paymentEntity = body.payload.payment.entity;
        const notes = paymentEntity.notes;
        const { user_id, booking_id } = notes;

        if (!user_id || !booking_id) {
            console.error(`Webhook Error: Missing user_id or booking_id in payment notes for payment ${paymentEntity.id}`);
            return NextResponse.json({ status: 'ok', message: 'Missing notes, cannot process.' });
        }

        const bookingRef = adminDb.collection('users').doc(user_id).collection('bookings').doc(booking_id);
        
        // Use a transaction to ensure atomicity.
        await adminDb.runTransaction(async (transaction) => {
            const bookingDoc = await transaction.get(bookingRef);
            if (!bookingDoc.exists) {
                throw new Error(`Booking ${booking_id} not found.`);
            }
            const bookingData = bookingDoc.data() as Booking;
            
            // Idempotency check: if already confirmed, do nothing.
            if (bookingData.status === 'CONFIRMED') {
                console.log(`Webhook: Booking ${booking_id} is already confirmed. Skipping.`);
                return;
            }

            if (bookingData.status !== 'PENDING') {
                throw new Error(`Booking status for ${booking_id} is '${bookingData.status}', not 'PENDING'.`);
            }
            
            const roomRef = adminDb.collection('hotels').doc(bookingData.hotelId).collection('rooms').doc(bookingData.roomId);
            const roomDoc = await transaction.get(roomRef);

            if (!roomDoc.exists) {
                throw new Error(`Room ${bookingData.roomId} in hotel ${bookingData.hotelId} not found.`);
            }
            
            const roomData = roomDoc.data() as Room;
            if ((roomData.availableRooms ?? 0) <= 0) {
                // In a real-world scenario, you might want to flag this for manual review/refund.
                throw new Error(`Overbooking detected for room ${bookingData.roomId}. No inventory.`);
            }

            // Decrement room inventory
            transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
            
            // Update booking status to CONFIRMED
            transaction.update(bookingRef, {
                status: 'CONFIRMED',
                razorpayPaymentId: paymentEntity.id,
            });
        });
        
        console.log(`Webhook: Successfully confirmed booking ${booking_id}.`);
    }

    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
