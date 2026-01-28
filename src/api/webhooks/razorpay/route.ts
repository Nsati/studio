
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking } from '@/lib/types';

/**
 * This webhook is the backup/reconciliation mechanism for payment confirmation.
 * The primary confirmation flow is triggered by the client after payment.
 * This webhook handles cases where the client-side flow might fail (e.g., user closes browser).
 */
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

  // Step 1: Verify the signature to ensure the request is from Razorpay
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(text);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== signature) {
    console.warn('Invalid Razorpay webhook signature received');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const { adminDb, error: adminError } = getFirebaseAdmin();
  if (adminError || !adminDb) {
    console.error('Webhook Error: Firebase Admin SDK not initialized.', adminError);
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  }

  try {
    const event = JSON.parse(text);

    // We are interested in the event when a payment is successful
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const notes = paymentEntity.notes;
      const bookingId = notes?.booking_id;
      const userId = notes?.user_id;
      const razorpayPaymentId = paymentEntity.id;

      if (!bookingId || !userId) {
        console.warn(`Webhook received for payment ${paymentEntity.id} without a booking_id or user_id in notes. Cannot process.`);
        // Return 200 OK because this is not a server error, we just can't process it. Razorpay won't retry.
        return NextResponse.json({ status: 'ok, missing notes' });
      }

      const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);

      // Step 2: Use a transaction to safely update the booking status.
      await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        
        // This check makes the webhook idempotent.
        // If the booking is already confirmed (likely by the client-side flow), we do nothing.
        if (bookingDoc.exists && bookingDoc.data()?.status === 'PENDING') {
            transaction.update(bookingRef, {
                status: 'CONFIRMED',
                razorpayPaymentId: razorpayPaymentId,
            });
             console.log(`✅ [Webhook] Booking ${bookingId} confirmed successfully.`);
        } else {
             console.log(`[Webhook]: Booking ${bookingId} was not in PENDING state. Current status: ${bookingDoc.data()?.status || 'Not Found'}. Ignoring webhook.`);
        }
      });
    }

    // Acknowledge receipt of the event to Razorpay
    return NextResponse.json({ status: 'received' });
  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error);
    // Return a 500 status code to indicate failure, so Razorpay can retry.
    return NextResponse.json({ status: 'error', message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
