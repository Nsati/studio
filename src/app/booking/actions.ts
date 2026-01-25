
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getAdminDb } from '@/firebase/admin';
import type { Booking, Room, ConfirmedBookingSummary } from '@/lib/types';
import * as admin from 'firebase-admin';

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
      'CRITICAL: Razorpay keys are not configured in environment variables. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.'
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
      amount: Math.round(amount * 100), // amount in the smallest currency unit, ensuring integer
      currency: 'INR',
      receipt: `receipt_${crypto.randomBytes(6).toString('hex')}`,
      notes, // Pass notes for webhook context
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
        console.error('CRITICAL: Firebase Admin SDK is not initialized.');
        return { success: false, error: 'Database service is not configured on the server.' };
    }

    // 1. Verify Razorpay signature
    const body = paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== paymentData.razorpay_signature) {
        return { success: false, error: 'Payment verification failed: Invalid signature.' };
    }

    // 2. Run Firestore transaction
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

            const [roomDoc, hotelDoc] = await transaction.getAll(roomRef, hotelRef);
            
            if (!roomDoc.exists) throw new Error("Room data not found.");
            if (!hotelDoc.exists) throw new Error("Hotel data not found.");
            
            const roomData = roomDoc.data() as Room;
            const hotelData = hotelDoc.data() as any;

            if ((roomData.availableRooms ?? roomData.totalRooms) <= 0) {
                throw new Error(`Overbooking detected for room ${bookingData.roomId}.`);
            }
            
            // Atomically update inventory and booking status
            transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
            transaction.update(bookingRef, {
                status: 'CONFIRMED',
                razorpayPaymentId: paymentData.razorpay_payment_id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Create public summary doc for success page
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

export async function checkServerHealth(): Promise<{ isConfigured: boolean }> {
  // This check relies on getAdminDb which returns null if the Admin SDK is not initialized.
  const db = getAdminDb();
  return { isConfigured: !!db };
}
