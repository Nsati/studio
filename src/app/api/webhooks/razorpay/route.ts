
'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/firebase/admin';
import * as admin from 'firebase-admin';
import type { Booking, Room, Hotel, ConfirmedBookingSummary } from '@/lib/types';
import { sendBookingConfirmationEmail } from '@/services/email';

// This webhook now serves as a secondary notification and fallback mechanism.
// The primary booking confirmation logic is handled by `verifyPaymentAndConfirmBooking` server action
// which is called by the client upon successful payment.
export async function POST(req: NextRequest) {
  console.log('--- Razorpay Webhook Endpoint Hit ---');

  const db = getAdminDb();

  if (!db) {
    const configError = 'FATAL - Firebase Admin SDK is not initialized. Webhook cannot proceed.';
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
    
    if (event === 'payment.captured') {
      const paymentEntity = body.payload.payment.entity;
      const notes = paymentEntity.notes;
      const { user_id, booking_id } = notes;

      console.log(`✅ "payment.captured" event received for Payment ID: ${paymentEntity.id}, Booking ID: ${booking_id}`);

      if (!user_id || !booking_id) {
          console.warn(`Webhook for payment ${paymentEntity.id} is missing user_id or booking_id in notes. Cannot process fallback.`);
          return NextResponse.json({ status: 'received', message: 'Ignoring event with missing notes.' });
      }

      // Fallback logic: Check if the booking document exists. If not, it means the client-side flow failed.
      const bookingRef = db.collection('users').doc(user_id).collection('bookings').doc(booking_id);
      const bookingDoc = await bookingRef.get();

      if (!bookingDoc.exists) {
          console.error(`🚨 FALLBACK TRIGGERED: Booking ${booking_id} was not found. The client-side confirmation may have failed. The webhook should handle this, but the logic is currently simplified. In a production app, you would recreate the booking here using payment notes.`);
          // In a full production app, you would use all the notes from the payment
          // to run the same booking confirmation logic found in the `verifyPaymentAndConfirmBooking` action.
          // For this simplified example, we just log the error.
      } else {
          console.log(`✅ Idempotency check passed for webhook. Booking ${booking_id} was already confirmed by the primary flow.`);
      }

    } else {
        console.log(`ℹ️ Webhook received non-payment event: "${event}". Ignoring.`);
    }

    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('❌ FATAL: Webhook handler failed:', error.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
