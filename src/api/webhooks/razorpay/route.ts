
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking, Room } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

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

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const notes = paymentEntity.notes;
      const bookingId = notes?.booking_id;
      const userId = notes?.user_id;
      const razorpayPaymentId = paymentEntity.id;

      if (!bookingId || !userId) {
        console.warn(`Webhook received for payment ${paymentEntity.id} without a booking_id or user_id in notes.`);
        return NextResponse.json({ status: 'ok, missing notes' });
      }

      const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);

      await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);

        if (!bookingDoc.exists) {
          throw new Error(`Booking document not found for ID: ${bookingId}`);
        }
        
        const bookingData = bookingDoc.data() as Booking;
        
        if (bookingData.status === 'CONFIRMED') {
          console.log(`Webhook: Booking ${bookingId} is already confirmed. Ignoring.`);
          return;
        }

        const roomRef = adminDb.doc(`hotels/${bookingData.hotelId}/rooms/${bookingData.roomId}`);
        const roomDoc = await transaction.get(roomRef);

        if (!roomDoc.exists) {
          throw new Error(`Room document not found for hotelId: ${bookingData.hotelId}, roomId: ${bookingData.roomId}`);
        }
        const roomData = roomDoc.data() as Room;

        if ((roomData.availableRooms ?? 0) <= 0) {
          console.error(`CRITICAL: Payment captured for sold-out room. BookingID: ${bookingId}, RoomID: ${bookingData.roomId}`);
          throw new Error('Room is sold out.');
        }

        transaction.update(bookingRef, {
          status: 'CONFIRMED',
          razorpayPaymentId: razorpayPaymentId,
        });

        transaction.update(roomRef, {
          availableRooms: FieldValue.increment(-1),
        });

        // The public summary document is no longer needed.
        // The success page will read the main booking document directly.
      });

      console.log(`✅ Booking ${bookingId} confirmed successfully via webhook.`);
    }

    return NextResponse.json({ status: 'received' });
  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ status: 'ok, transaction failed', error: error.message });
  }
}
