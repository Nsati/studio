
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { Booking } from '@/lib/types';


/**
 * Creates a PENDING booking document in Firestore using the Admin SDK,
 * then creates a corresponding Razorpay order. This server-side approach
 * is more robust than creating the booking from the client.
 */
export async function initializeBookingAndCreateOrder(
  bookingData: Omit<Booking, 'id' | 'status' | 'createdAt' | 'razorpayPaymentId'>
) {
  const admin = getFirebaseAdmin();
  if (!admin) {
    console.error('SERVER ACTION ERROR: Firebase Admin SDK is not initialized. Check server configuration and .env file.');
    return { success: false, error: 'Server is not configured for payments. Please contact support.', order: null, keyId: null, bookingId: null };
  }
  const adminDb = admin.firestore;

  const { 
    userId, hotelId, roomId, roomType, checkIn, checkOut, guests, totalPrice, customerName, customerEmail
  } = bookingData;

  const bookingId = `booking_${Date.now()}`;
  const bookingRef = adminDb.collection('users').doc(userId).collection('bookings').doc(bookingId);

  // 1. Create the PENDING booking document on the server
  try {
    const pendingBooking: Omit<Booking, 'id' | 'razorpayPaymentId'> = {
      ...bookingData,
      status: 'PENDING',
      createdAt: Timestamp.now(),
    };
    await bookingRef.set({ id: bookingId, ...pendingBooking });
  } catch (error: any) {
    console.error('SERVER ACTION ERROR: Failed to create PENDING booking:', error);
    return { success: false, error: 'Could not initialize booking on the server. Please try again.', order: null, keyId: null, bookingId: null };
  }

  // 2. Create Razorpay order
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Payment gateway is not configured. Missing API keys.');
    }
    
    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(totalPrice * 100);
    if (amountInPaise < 100) {
        throw new Error('Order amount must be at least ₹1.00');
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_booking_${bookingId}`,
      notes: {
        booking_id: bookingId,
        user_id: userId,
        hotel_id: hotelId,
        room_id: roomId,
      },
    };
    
    const order = await razorpayInstance.orders.create(options);
    
    if (!order) {
      throw new Error('Failed to create order with Razorpay.');
    }
    
    return { success: true, order, keyId, error: null, bookingId: bookingId };

  } catch (error: any) {
    console.error('SERVER ACTION ERROR: Failed to create Razorpay order:', error);
    // Attempt to delete the PENDING booking if order creation fails, to avoid orphaned bookings
    await bookingRef.delete().catch(delErr => console.error('Failed to clean up orphaned pending booking:', delErr));
    return { success: false, error: error.message || 'An unknown error occurred.', order: null, keyId: null, bookingId: null };
  }
}


/**
 * Verifies a Razorpay payment signature.
 * This is kept for optional client-side checks but is not the primary confirmation mechanism anymore.
 */
export async function verifyRazorpaySignature(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret || webhookSecret === 'your_webhook_secret_here') {
        console.error("RAZORPAY_WEBHOOK_SECRET is not set or is still the placeholder. Cannot verify signature.");
        return { success: false, error: "Server configuration error: Webhook secret is missing or not configured." };
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            return { success: true, error: null };
        } else {
            return { success: false, error: 'Signature mismatch.' };
        }
    } catch (error: any) {
        console.error('Signature verification failed:', error);
        return { success: false, error: 'An unexpected error occurred during signature verification.' };
    }
}
