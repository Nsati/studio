
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { adminDb } from '@/firebase/admin';
import * as admin from 'firebase-admin';
import type { Booking, Room } from '@/lib/types';

interface CreateOrderResponse {
  success: boolean;
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  keyId?: string;
  error?: string;
}

export async function createRazorpayOrder(
  amount: number,
  notes: { [key: string]: string }
): Promise<CreateOrderResponse> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error(
      'CRITICAL: Razorpay keys are not configured in environment variables.'
    );
    return {
      success: false,
      error:
        'Payment gateway is not configured on the server. Please contact support.',
    };
  }

  try {
    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: 'INR',
      receipt: `receipt_${crypto.randomBytes(6).toString('hex')}`,
      notes, // Pass notes for webhook context
    };
    const order = await razorpayInstance.orders.create(options);

    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: keyId,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Could not create Razorpay order.';
    return { success: false, error: errorMessage };
  }
}

interface VerifyPaymentResponse {
  success: boolean;
  error?: string;
}

export async function verifyAndFinalizePayment(
  data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
  context: {
    bookingId: string;
    userId: string;
  }
): Promise<VerifyPaymentResponse> {
  if (!adminDb) {
    console.error("❌ Payment Finalization Error: Firebase Admin SDK not initialized. Cannot confirm booking.");
    return { success: false, error: 'Server payment finalization is not configured.' };
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    console.error('CRITICAL: RAZORPAY_KEY_SECRET is not set in .env file.');
    return { success: false, error: 'Server payment configuration error.' };
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.warn('Payment verification failed: Signatures do not match.');
    return { success: false, error: 'Payment verification failed.' };
  }

  // Signature is valid, now finalize the booking in a transaction.
  try {
    const bookingRef = adminDb
      .collection('users')
      .doc(context.userId)
      .collection('bookings')
      .doc(context.bookingId);

    await adminDb.runTransaction(async (transaction) => {
      const bookingDoc = await transaction.get(bookingRef);
      if (!bookingDoc.exists) {
        throw new Error(`Booking ${context.bookingId} not found in DB.`);
      }

      const booking = bookingDoc.data() as Booking;

      // Idempotency: If already confirmed, do nothing.
      if (booking.status === 'CONFIRMED') {
        console.log(`Client-flow: Booking ${context.bookingId} is already confirmed. Skipping.`);
        return;
      }

      const roomRef = adminDb
        .collection('hotels')
        .doc(booking.hotelId)
        .collection('rooms')
        .doc(booking.roomId);
      const roomDoc = await transaction.get(roomRef);

      if (!roomDoc.exists) {
        throw new Error(`Room ${booking.roomId} not found.`);
      }
      const room = roomDoc.data() as Room;

      if ((room.availableRooms ?? 0) <= 0) {
        throw new Error(
          `Overbooking detected for room ${booking.roomId}! No available rooms.`
        );
      }

      // Atomically update both documents
      transaction.update(roomRef, {
        availableRooms: admin.firestore.FieldValue.increment(-1),
      });
      transaction.update(bookingRef, {
        status: 'CONFIRMED',
        razorpayPaymentId: razorpay_payment_id,
      });
    });

    console.log(`Client-flow: Booking ${context.bookingId} confirmed successfully.`);
    return { success: true };
  } catch (error: any) {
    console.error('FATAL: Error finalizing booking from client-flow:', error.message);
    return {
      success: false,
      error: 'Could not confirm your booking. Please contact support.',
    };
  }
}
