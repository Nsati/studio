
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getAdminDb } from '@/firebase/admin';
import type { Booking, Room, ConfirmedBookingSummary } from '@/lib/types';
import * as admin from 'firebase-admin';

/**
 * Checks if the Firebase Admin SDK has been configured on the server.
 * This is used by the client to determine if server-dependent features can be enabled.
 * @returns A promise that resolves to an object indicating if the server is configured.
 */
export async function checkServerConfig(): Promise<{ isConfigured: boolean }> {
  const db = getAdminDb();
  return { isConfigured: !!db };
}


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
  notes: { [key:string]: string }
): Promise<CreateOrderResponse> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error(
      'CRITICAL: Razorpay keys are not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
    return {
      success: false,
      error:
        'Payment gateway is not configured correctly on the server. Please contact support.',
    };
  }

  try {
    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100), 
      currency: 'INR',
      receipt: `receipt_${crypto.randomBytes(6).toString('hex')}`,
      notes,
    };
    const order = await razorpayInstance.orders.create(options);

    return {
      success: true,
      order: {
        id: order.id,
        amount: Number(order.amount),
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
  bookingId?: string;
}

export async function verifyPaymentAndConfirmBooking(
  paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
  bookingIdentifiers: {
    userId: string;
    bookingId: string;
  }
): Promise<VerifyPaymentResponse> {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        console.error('CRITICAL: RAZORPAY_KEY_SECRET is not configured.');
        return { success: false, error: 'Payment verification is not configured on the server.' };
    }

    const db = getAdminDb();
    if (!db) {
        console.error('CRITICAL: Firebase Admin SDK is not initialized for verifyPaymentAndConfirmBooking.');
        return { success: false, error: 'Database service is not configured on the server. Please set the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.' };
    }

    const body = paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== paymentData.razororpay_signature) {
        return { success: false, error: 'Payment verification failed: Invalid signature.' };
    }

    const bookingRef = db.collection('users').doc(bookingIdentifiers.userId).collection('bookings').doc(bookingIdentifiers.bookingId);

    try {
        await db.runTransaction(async (transaction) => {
            const bookingDoc = await transaction.get(bookingRef);
            if (!bookingDoc.exists || bookingDoc.data()?.status !== 'PENDING') {
                if (bookingDoc.data()?.status === 'CONFIRMED') {
                    console.log(`Booking ${bookingIdentifiers.bookingId} already confirmed. Idempotency check passed.`);
                    return; 
                }
                throw new Error("Booking not found or not in a pending state.");
            }
            
            const bookingData = bookingDoc.data() as Booking;
            const roomRef = db.collection('hotels').doc(bookingData.hotelId).collection('rooms').doc(bookingData.roomId);
            const hotelRef = db.collection('hotels').doc(bookingData.hotelId);

            const roomDoc = await transaction.get(roomRef);
            const hotelDoc = await transaction.get(hotelRef);
            
            if (!roomDoc.exists) throw new Error("Room data not found.");
            if (!hotelDoc.exists) throw new Error("Hotel data not found.");
            
            const roomData = roomDoc.data() as Room;
            const hotelData = hotelDoc.data() as any;

            if ((roomData.availableRooms ?? roomData.totalRooms) <= 0) {
                throw new Error(`Overbooking detected for room ${bookingData.roomId}.`);
            }
            
            transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
            transaction.update(bookingRef, {
                status: 'CONFIRMED',
                razorpayPaymentId: paymentData.razorpay_payment_id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            const summaryRef = db.collection('confirmedBookings').doc(bookingIdentifiers.bookingId);
            const summaryData: ConfirmedBookingSummary = {
                id: bookingIdentifiers.bookingId,
                hotelId: bookingData.hotelId,
                hotelName: hotelData.name,
                hotelCity: hotelData.city,
                hotelAddress: hotelData.address,
                customerName: bookingData.customerName,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                guests: bookingData.guests,
                totalPrice: bookingData.totalPrice,
                roomType: bookingData.roomType,
                userId: bookingData.userId,
            };
            transaction.set(summaryRef, summaryData);
        });

        return { success: true, bookingId: bookingIdentifiers.bookingId };

    } catch (error: any) {
        console.error("Booking confirmation transaction failed:", error);
        return { success: false, error: `Your payment was successful, but we couldn't confirm your booking automatically: ${error.message}. Please contact support with booking ID ${bookingIdentifiers.bookingId}.` };
    }
}
