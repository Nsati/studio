
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/firebase/admin';
import * as admin from 'firebase-admin';
import type { Booking, Room, Hotel } from '@/lib/types';
import { sendBookingConfirmationEmail } from '@/services/email';

export async function POST(req: NextRequest) {
  console.log('--- Razorpay Webhook Endpoint Hit ---');

  if (!adminDb) {
    const configError = 'FATAL - Firebase Admin SDK is not initialized. Webhook cannot proceed. Please check server logs for instructions on setting GOOGLE_APPLICATION_CREDENTIALS_JSON.';
    console.error('❌ STEP 0:', configError);
    return NextResponse.json({ error: configError }, { status: 500 });
  }
  
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) {
    console.error('❌ STEP 0: FATAL - RAZORPAY_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    console.warn('⚠️ Webhook ignored: Signature missing.');
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  try {
    const bodyText = await req.text();
    console.log('✅ STEP 1: Webhook received with body.');
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('❌ Webhook Error: Invalid signature.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    console.log('✅ STEP 2: Webhook signature verified successfully.');

    const body = JSON.parse(bodyText);
    const event = body.event;
    const payload = body.payload;

    if (event === 'payment.captured') {
      console.log('✅ STEP 3: "payment.captured" event received.');
      const paymentEntity = payload.payment.entity;
      const { user_id, booking_id } = paymentEntity.notes;

      if (!user_id || !booking_id) {
        console.error(`❌ Webhook Error: Missing user_id or booking_id in payment notes for payment ${paymentEntity.id}`);
        return NextResponse.json({ status: 'ok', message: 'Missing notes, but acknowledged.' });
      }

      const bookingRef = adminDb.collection('users').doc(user_id).collection('bookings').doc(booking_id);

      const booking = await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) throw new Error(`Booking ${booking_id} not found.`);

        const bookingData = bookingDoc.data() as Booking;

        if (bookingData.status === 'CONFIRMED') {
          console.log(`✅ STEP 4: Idempotency check pass. Booking ${booking_id} is already confirmed.`);
          return bookingData;
        }
        
        console.log(`ℹ️ STEP 4: [Webhook Fallback] Booking ${booking_id} was PENDING. Confirming now...`);

        const roomRef = adminDb.collection('hotels').doc(bookingData.hotelId).collection('rooms').doc(bookingData.roomId);
        const roomDoc = await transaction.get(roomRef);

        if (!roomDoc.exists) throw new Error(`Room ${bookingData.roomId} not found.`);
        const room = roomDoc.data() as Room;

        if ((room.availableRooms ?? 0) <= 0) {
          throw new Error(`Overbooking detected for room ${bookingData.roomId}! No available rooms.`);
        }
        
        transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
        transaction.update(bookingRef, {
          status: 'CONFIRMED',
          razorpayPaymentId: paymentEntity.id,
        });

        return { ...bookingData, status: 'CONFIRMED', razorpayPaymentId: paymentEntity.id } as Booking;
      });
      console.log(`✅ STEP 5: Webhook transaction for ${booking_id} completed.`);

       if (booking && booking.status === 'CONFIRMED') {
            console.log('✅ STEP 6: Booking confirmed, attempting to send email.');
            try {
                const hotelDoc = await adminDb.collection('hotels').doc(booking.hotelId).get();
                const hotelName = hotelDoc.exists ? (hotelDoc.data() as Hotel).name : 'Your Booked Hotel';

                await sendBookingConfirmationEmail({
                    to: booking.customerEmail,
                    customerName: booking.customerName,
                    hotelName: hotelName,
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut,
                    bookingId: booking.id || booking_id
                });
                console.log(`✅ STEP 7: Confirmation email sent to ${booking.customerEmail}.`);
            } catch (emailError: any) {
                console.error(`❌ STEP 7: Failed to send email for booking ${booking_id}:`, emailError.message);
            }
        }

    } else {
        console.log(`ℹ️ Webhook received non-payment event: "${event}". Ignoring.`);
    }

    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('❌ Webhook handler failed:', error.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
