
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

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) {
    console.error('❌ STEP 0: RAZORPAY_WEBHOOK_SECRET is not set. Cannot verify webhook signature.');
    return NextResponse.json({ status: 'error', message: 'Webhook secret not configured on server.' }, { status: 400 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    console.warn('⚠️ Webhook ignored: Signature missing.');
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  const bodyText = await req.text();
  
  try {
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

    // Only process successful payment events
    if (event === 'payment.captured') {
      console.log('✅ STEP 2: Received "payment.captured" event.');
      const paymentEntity = body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error('Razorpay keys are not configured on the server.');
      }
      
      const rzpInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await rzpInstance.orders.fetch(orderId);

      if (!order || !order.notes || !order.notes.booking_id || !order.notes.user_id || !order.notes.hotel_id || !order.notes.room_id) {
        throw new Error(`Order ${orderId} is missing required notes for booking confirmation.`);
      }

      const { booking_id, user_id, hotel_id, room_id } = order.notes;
      console.log(`✅ STEP 3: Extracted details from order notes: booking_id=${booking_id}, user_id=${user_id}`);
      
      const adminDb = getFirebaseAdmin().firestore();

      // Define document references
      const roomRef = adminDb.collection('hotels').doc(hotel_id).collection('rooms').doc(room_id);
      const bookingRef = adminDb.collection('users').doc(user_id).collection('bookings').doc(booking_id);
      const hotelRef = adminDb.collection('hotels').doc(hotel_id);
      const summaryRef = adminDb.collection('confirmedBookings').doc(booking_id);

      // Run the confirmation logic within a transaction
      await adminDb.runTransaction(async (transaction) => {
        const [roomDoc, bookingDoc, hotelDoc] = await transaction.getAll(roomRef, bookingRef, hotelRef);
        
        if (!bookingDoc.exists) throw new Error(`Booking document ${booking_id} not found.`);
        if (!roomDoc.exists) throw new Error(`Room document ${room_id} not found.`);
        if (!hotelDoc.exists) throw new Error(`Hotel document ${hotel_id} not found.`);
        
        const bookingData = bookingDoc.data() as Booking;
        // If booking is already confirmed, we can stop to prevent double-counting
        if (bookingData.status === 'CONFIRMED') {
            console.log(`ℹ️ Booking ${booking_id} is already confirmed. Skipping transaction.`);
            return;
        }

        const roomData = roomDoc.data() as Room;
        const hotelData = hotelDoc.data() as Hotel;

        const currentAvailability = roomData.availableRooms ?? roomData.totalRooms;
        if (currentAvailability <= 0) {
          throw new Error(`Room ${room_id} is sold out. Cannot confirm booking ${booking_id}.`);
        }

        // Create the summary object for the success page
        const summaryData: ConfirmedBookingSummary = {
          id: booking_id,
          hotelId: hotel_id,
          hotelName: hotelData.name,
          hotelCity: hotelData.city,
          hotelAddress: hotelData.address || '',
          customerName: bookingData.customerName,
          // Timestamps from firestore need to be converted back to JS dates for summary
          checkIn: (bookingData.checkIn as any).toDate(),
          checkOut: (bookingData.checkOut as any).toDate(),
          guests: bookingData.guests,
          totalPrice: bookingData.totalPrice,
          roomType: bookingData.roomType,
          userId: user_id,
        };

        // Perform the three atomic writes
        transaction.update(roomRef, { availableRooms: FieldValue.increment(-1) });
        transaction.update(bookingRef, {
            status: 'CONFIRMED',
            razorpayPaymentId: paymentId,
        });
        transaction.set(summaryRef, summaryData);
      });

      console.log(`✅ STEP 4: Transaction for booking ${booking_id} completed successfully.`);
    } else {
        console.log(`ℹ️ Received and verified a "${event}" event. No action taken.`);
    }

    // Acknowledge receipt to Razorpay
    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('❌ FATAL: Webhook handler failed:', error.message);
    // Return a 200 so Razorpay doesn't retry for our internal server errors.
    // We should monitor our logs for these.
    return NextResponse.json({ error: 'Webhook handler failed internally', details: error.message }, { status: 200 });
  }
}
