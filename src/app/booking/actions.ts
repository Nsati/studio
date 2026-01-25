
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

// --- NEW FUNCTION ---
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
  bookingDetails: {
    id: string;
    userId: string;
    hotelId: string;
    roomId: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    customerName: string;
    customerEmail: string;
  },
  hotelDetails: {
    name: string;
    city: string;
    address?: string;
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
    const bookingRef = db.collection('users').doc(bookingDetails.userId).collection('bookings').doc(bookingDetails.id);
    const roomRef = db.collection('hotels').doc(bookingDetails.hotelId).collection('rooms').doc(bookingDetails.roomId);
    const summaryRef = db.collection('confirmedBookings').doc(bookingDetails.id);

    try {
        await db.runTransaction(async (transaction) => {
            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists) {
                throw new Error("Room not found. Cannot confirm booking.");
            }
            const roomData = roomDoc.data() as Room;

            if ((roomData.availableRooms ?? roomData.totalRooms) <= 0) {
                throw new Error(`Overbooking detected for room ${bookingDetails.roomId}.`);
            }

            // Decrement room count
            transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });

            // Create user booking document
            const finalBookingData: Booking = {
                ...bookingDetails,
                checkIn: new Date(bookingDetails.checkIn),
                checkOut: new Date(bookingDetails.checkOut),
                status: 'CONFIRMED',
                createdAt: new Date(),
                razorpayPaymentId: paymentData.razorpay_payment_id,
            };
            transaction.set(bookingRef, finalBookingData);

            // Create public summary document
             const summaryData: ConfirmedBookingSummary = {
                id: bookingDetails.id,
                hotelId: bookingDetails.hotelId,
                hotelName: hotelDetails.name,
                hotelCity: hotelDetails.city,
                hotelAddress: hotelDetails.address,
                customerName: bookingDetails.customerName,
                checkIn: new Date(bookingDetails.checkIn),
                checkOut: new Date(bookingDetails.checkOut),
                guests: bookingDetails.guests,
                totalPrice: bookingDetails.totalPrice,
                roomType: bookingDetails.roomType,
                userId: bookingDetails.userId,
            };
            transaction.set(summaryRef, summaryData);
        });

        return { success: true, bookingId: bookingDetails.id };

    } catch (error: any) {
        console.error("Booking confirmation transaction failed:", error);
        return { success: false, error: `Booking confirmation failed: ${error.message}. Please contact support with payment ID ${paymentData.razorpay_payment_id}.` };
    }
}
