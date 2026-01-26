
'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { getFirebaseAdmin } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Booking, Hotel, Room, ConfirmedBookingSummary } from '@/lib/types';

/**
 * This webhook is the single source of truth for confirming a booking after a successful payment.
 * It listens for the 'payment.captured' event from Razorpay.
 *
 * Flow:
 * 1. Verify the webhook signature to ensure it's from Razorpay.
 * 2. If the event is 'payment.captured', fetch the associated order from Razorpay.
 * 3. Extract booking_id, user_id, hotel_id, and room_id from the order notes.
 * 4. Fetch the corresponding booking and hotel documents from Firestore.
 * 5. Run a secure, atomic transaction on the server to:
 *    - Decrement the room's availability count.
 *    - Update the booking status to 'CONFIRMED'.
 *    - Create a public summary document for the success page.
 */
export async function POST(req: NextRequest) {
  console.log('--- Razorpay Webhook Endpoint Hit ---');

  const admin = getFirebaseAdmin();
  if (!admin) {
    console.error('❌ FATAL WEBHOOK ERROR: Firebase Admin SDK is not initialized. Cannot process booking confirmation.');
    return NextResponse.json({ status: 'error', message: 'Internal server configuration error.' }, { status: 500 });
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret || !keyId || !keySecret) {
      console.error('❌ FATAL WEBHOOK ERROR: Razorpay environment variables are missing.');
      return NextResponse.json({ status: 'error', message: 'Internal server configuration error.' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  const bodyText = await req.text();

  try {
    // 1. Verify Signature
    if (!signature) {
        console.warn('⚠️ Webhook ignored: Signature missing.');
        return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('❌ Webhook Error: Invalid signature.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    console.log('✅ STEP 1: Webhook signature verified successfully.');
    
    const body = JSON.parse(bodyText);
    const event = body.event;

    // 2. Process only successful payment events
    if (event === 'payment.captured') {
      console.log('✅ STEP 2: Received "payment.captured" event.');
      const paymentEntity = body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // 3. Initialize services
      const rzpInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const adminDb = admin.firestore;
      
      // 4. Fetch order and run transaction
      const order = await rzpInstance.orders.fetch(orderId);

      if (!order?.notes?.booking_id || !order.notes.user_id || !order.notes.hotel_id || !order.notes.room_id) {
        // This is a critical error. The order notes are our source of truth.
        // Returning 500 allows retry in case of a temporary Razorpay API issue.
        throw new Error(`Order ${orderId} is missing required notes for booking confirmation.`);
      }

      const { booking_id, user_id, hotel_id, room_id } = order.notes;
      console.log(`✅ STEP 3: Extracted details from order notes: booking_id=${booking_id}, user_id=${user_id}`);
      
      const roomRef = adminDb.collection('hotels').doc(hotel_id).collection('rooms').doc(room_id);
      const bookingRef = adminDb.collection('users').doc(user_id).collection('bookings').doc(booking_id);
      const hotelRef = adminDb.collection('hotels').doc(hotel_id);
      const summaryRef = adminDb.collection('confirmedBookings').doc(booking_id);

      await adminDb.runTransaction(async (transaction) => {
        const [roomDoc, bookingDoc, hotelDoc] = await transaction.getAll(roomRef, bookingRef, hotelRef);
        
        if (!bookingDoc.exists) throw new Error(`Booking document ${booking_id} not found.`);
        if (!roomDoc.exists) throw new Error(`Room document ${room_id} not found.`);
        if (!hotelDoc.exists) throw new Error(`Hotel document ${hotel_id} not found.`);
        
        const bookingData = bookingDoc.data() as Booking;
        
        if (bookingData.status === 'CONFIRMED') {
            console.log(`ℹ️ Booking ${booking_id} is already confirmed. Skipping transaction.`);
            return; // Idempotent: already processed
        }
        
        // Only confirm PENDING bookings.
        if (bookingData.status !== 'PENDING') {
            console.error(`❌ Webhook Error: Attempted to confirm a booking with status '${bookingData.status}'. Booking ID: ${booking_id}`);
            // Don't throw, just log and exit. We don't want to retry this.
            return;
        }

        const roomData = roomDoc.data() as Room;
        const hotelData = hotelDoc.data() as Hotel;

        if ((roomData.availableRooms ?? roomData.totalRooms) <= 0) {
          throw new Error(`Room ${room_id} is sold out. Cannot confirm booking ${booking_id}. Manual intervention required.`);
        }

        const summaryData: ConfirmedBookingSummary = {
          id: booking_id,
          hotelId: hotel_id,
          hotelName: hotelData.name,
          hotelCity: hotelData.city,
          hotelAddress: hotelData.address || '',
          customerName: bookingData.customerName,
          checkIn: (bookingData.checkIn as any).toDate(),
          checkOut: (bookingData.checkOut as any).toDate(),
          guests: bookingData.guests,
          totalPrice: bookingData.totalPrice,
          roomType: bookingData.roomType,
          userId: user_id,
        };

        transaction.update(roomRef, { availableRooms: FieldValue.increment(-1) });
        transaction.update(bookingRef, { status: 'CONFIRMED', razorpayPaymentId: paymentId });
        transaction.set(summaryRef, summaryData);
      });

      console.log(`✅ STEP 4: Transaction for booking ${booking_id} completed successfully.`);
    } else {
        console.log(`ℹ️ Received and verified a "${event}" event. No action taken.`);
    }

    return NextResponse.json({ status: 'received' }, { status: 200 });

  } catch (error: any) {
    console.error('❌ FATAL WEBHOOK ERROR:', error.message);
    // Return 500 for internal/transient errors so Razorpay retries the webhook.
    return NextResponse.json({ error: 'Webhook handler failed internally', details: error.message }, { status: 500 });
  }
}
