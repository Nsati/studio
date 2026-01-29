
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking } from '@/lib/types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const text = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature not found' }, { status: 400 });
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(text);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { adminDb, error: adminError } = getFirebaseAdmin();
  if (adminError || !adminDb) {
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  }

  try {
    const event = JSON.parse(text);

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const notes = paymentEntity.notes;
      const bookingId = notes?.booking_id;
      const userId = notes?.user_id;

      if (!bookingId || !userId) {
        console.warn('Webhook received without a booking_id or user_id in notes. Cannot process.');
        // Return 200 OK because this is not a server error, we just can't process it. Razorpay won't retry.
        return NextResponse.json({ status: 'ok, missing notes' });
      }

      const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);

      // Here you would typically verify the amount and other details.
      // For this example, we'll just update the status.
      await updateDoc(bookingRef, {
        status: 'CONFIRMED',
        razorpayPaymentId: paymentEntity.id,
      });

      console.log(`Webhook confirmed booking: ${bookingId}`);
    }

    return NextResponse.json({ status: 'received' });
  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
