import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import getRawBody from 'raw-body';
import { adminDb } from '@/firebase/admin';
import * as admin from 'firebase-admin';
import { sendBookingConfirmationEmail } from '@/services/email';
import type { Booking } from '@/lib/types';

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

      await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) throw new Error(`Booking ${booking_id} not found.`);

        const booking = bookingDoc.data() as Booking;

        if (booking.status === 'CONFIRMED') {
          console.log(`✅ STEP 4: Idempotency check pass. Booking ${booking_id} is already confirmed.`);
          return; // Exit transaction successfully
        }
        
        // This is a fallback. The main confirmation happens on the client-side action.
        // But if that fails, the webhook ensures the booking is confirmed.
        transaction.update(bookingRef, {
          status: 'CONFIRMED',
          razorpayPaymentId: paymentEntity.id,
        });
        console.log(`✅ STEP 4: [Webhook Fallback] Booking status updated to CONFIRMED for ${booking_id}.`);
      });

      // --- Transaction successful, now send email (outside transaction) ---
      const updatedBookingSnap = await bookingRef.get();
      const confirmedBooking = updatedBookingSnap.data()! as Booking;

      console.log('✅ STEP 5: Attempting to send confirmation email.');
      try {
        await sendBookingConfirmationEmail(confirmedBooking);
        console.log(`✅ STEP 6: Email successfully sent to ${confirmedBooking.customerEmail}.`);
      } catch (emailError: any) {
        console.error(`❌ STEP 6: FAILED to send email for booking ${booking_id}. Error: ${emailError.message}`);
        // IMPORTANT: Do not throw an error here. The booking is confirmed.
        // Email failure should not cause the webhook to fail.
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
