import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import getRawBody from 'raw-body';
import { adminDb } from '@/firebase/admin';
import * as admin from 'firebase-admin';
import { sendBookingConfirmationEmail } from '@/services/email';
import type { Booking, Room } from '@/lib/types';

// Disable Next.js body parser to access the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  console.log('--- Razorpay Webhook Endpoint Hit ---');

  if (!adminDb) {
    console.error('❌ STEP 0: FATAL - Firebase Admin SDK is not initialized. Webhook cannot proceed.');
    // Return 500 so Razorpay might retry later if the admin config is fixed.
    return NextResponse.json({ error: 'Server not configured for Firebase Admin' }, { status: 500 });
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
    const rawBody = await getRawBody(req.body!);
    console.log('✅ STEP 1: Webhook received with body.');
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('❌ Webhook Error: Invalid signature.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    console.log('✅ STEP 2: Webhook signature verified successfully.');

    const body = JSON.parse(rawBody.toString());
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

      // This transaction acts as a fallback/redundancy. The primary confirmation
      // happens on the client-side action for a faster user experience.
      await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) throw new Error(`Booking ${booking_id} not found.`);

        const booking = bookingDoc.data() as Booking;

        // Idempotency check: If already confirmed (likely by client-flow), do nothing.
        if (booking.status === 'CONFIRMED') {
          console.log(`✅ STEP 4: Idempotency check pass. Booking ${booking_id} is already confirmed.`);
          return; // Exit transaction successfully
        }
        
        console.log(`ℹ️ STEP 4: [Webhook Fallback] Booking ${booking_id} was PENDING. Confirming now...`);

        // If it reaches here, the client-flow failed. The webhook will now save the day.
        const roomRef = adminDb.collection('hotels').doc(booking.hotelId).collection('rooms').doc(booking.roomId);
        const roomDoc = await transaction.get(roomRef);

        if (!roomDoc.exists) throw new Error(`Room ${booking.roomId} not found.`);
        const room = roomDoc.data() as Room;

        if ((room.availableRooms ?? 0) <= 0) {
          throw new Error(`Overbooking detected for room ${booking.roomId}! No available rooms.`);
        }
        
        // Atomically update both documents
        transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
        transaction.update(bookingRef, {
          status: 'CONFIRMED',
          razorpayPaymentId: paymentEntity.id,
        });
      });

      // --- Transaction successful, now send email (outside transaction) ---
      const updatedBookingSnap = await bookingRef.get();
      const confirmedBooking = updatedBookingSnap.data()! as Booking;

      console.log('✅ STEP 5: Attempting to send confirmation email.');
      await sendBookingConfirmationEmail(confirmedBooking);
      // The email service itself will log success or failure.
    } else {
        console.log(`ℹ️ Webhook received non-payment event: "${event}". Ignoring.`);
    }

    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('❌ Webhook handler failed:', error.message);
    // Return 500 to indicate an internal error. Razorpay will retry.
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
