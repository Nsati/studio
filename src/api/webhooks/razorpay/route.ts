
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/firebase/admin';
import { sendBookingConfirmationEmail } from '@/lib/mail-service';

/**
 * @fileOverview Hardened Razorpay Webhook for Production.
 * Handles payment verification, Firestore sync, and Bill generation/Email.
 */

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('CRITICAL: RAZORPAY_WEBHOOK_SECRET is not set');
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
    console.error('[WEBHOOK] Invalid signature detected.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { adminDb, error: adminError } = getFirebaseAdmin();
  if (adminError || !adminDb) {
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  }

  try {
    const event = JSON.parse(text);

    // Only process successful payment events
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const notes = paymentEntity.notes;
      const bookingId = notes?.booking_id;
      const userId = notes?.user_id;

      if (!bookingId || !userId) {
        console.warn('[WEBHOOK] Missing booking_id or user_id in notes.');
        return NextResponse.json({ status: 'ok, missing notes' });
      }

      const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);
      const bookingSnap = await bookingRef.get();

      if (!bookingSnap.exists) {
        console.warn(`[WEBHOOK] Booking ${bookingId} not found in Firestore.`);
        return NextResponse.json({ status: 'booking not found' });
      }

      const bookingData = bookingSnap.data();

      // 1. Update status in Firestore
      await bookingRef.update({
        status: 'CONFIRMED',
        razorpayPaymentId: paymentEntity.id,
        updatedAt: new Date().toISOString(),
      });

      console.log(`[WEBHOOK] Verified & Confirmed: ${bookingId}`);

      // 2. Generate Bill & Send Email
      if (bookingData?.customerEmail) {
        await sendBookingConfirmationEmail(bookingData.customerEmail, {
          customerName: bookingData.customerName || 'Guest',
          bookingId: bookingId,
          hotelName: bookingData.hotelName || 'Himalayan Property',
          checkIn: bookingData.checkIn || 'TBD',
          checkOut: bookingData.checkOut || 'TBD',
          amount: paymentEntity.amount / 100, // Convert from paise
          paymentId: paymentEntity.id,
        });
      }
    }

    return NextResponse.json({ status: 'received' });
  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
