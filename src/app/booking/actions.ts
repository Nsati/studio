
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
  // --- Start of New Validation Block ---
  const requiredServerEnvs = {
    'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID,
    'FIREBASE_PRIVATE_KEY': process.env.FIREBASE_PRIVATE_KEY,
    'FIREBASE_CLIENT_EMAIL': process.env.FIREBASE_CLIENT_EMAIL,
    'RAZORPAY_KEY_ID': process.env.RAZORPAY_KEY_ID,
    'RAZORPAY_KEY_SECRET': process.env.RAZORPAY_KEY_SECRET
  };

  for (const [key, value] of Object.entries(requiredServerEnvs)) {
    if (!value) {
      const errorMessage = `Server configuration error: The environment variable '${key}' is missing. Please check your .env file.`;
      console.error(`SERVER ACTION ERROR: ${errorMessage}`);
      return { success: false, error: errorMessage, order: null, keyId: null, bookingId: null };
    }
  }
  // --- End of New Validation Block ---

  const admin = getFirebaseAdmin();
  if (!admin) {
    const errorMessage = 'Failed to initialize Firebase Admin SDK. This can happen if the private key format is incorrect. Please review the key in your .env file and check server logs for details.';
    console.error(`SERVER ACTION ERROR: ${errorMessage}`);
    return { success: false, error: errorMessage, order: null, keyId: null, bookingId: null };
  }
  const adminDb = admin.firestore;

  const { 
    userId, hotelId, roomId, roomType, guests, totalPrice, customerName, customerEmail
  } = bookingData;

  // The checkIn and checkOut from the client are serialized as strings.
  // We must convert them back to Date objects for the Admin SDK.
  const checkInDate = new Date(bookingData.checkIn);
  const checkOutDate = new Date(bookingData.checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    const errorMessage = 'Invalid date format received from the client.';
    console.error(`SERVER ACTION ERROR: ${errorMessage}`);
    return { success: false, error: errorMessage, order: null, keyId: null, bookingId: null };
  }


  const bookingId = `booking_${Date.now()}`;
  const bookingRef = adminDb.collection('users').doc(userId).collection('bookings').doc(bookingId);

  // 1. Create the PENDING booking document on the server
  try {
     const pendingBookingData = {
      userId,
      hotelId,
      roomId,
      roomType,
      guests,
      totalPrice,
      customerName,
      customerEmail,
      checkIn: checkInDate, // Use the JS Date object
      checkOut: checkOutDate, // Use the JS Date object
      status: 'PENDING' as const,
      createdAt: Timestamp.now(), // Admin SDK can mix Timestamps and Dates
    };
    await bookingRef.set({ id: bookingId, ...pendingBookingData });
  } catch (error: any) {
    console.error('SERVER ACTION ERROR: Failed to create PENDING booking:', error);
    return { success: false, error: 'Could not initialize booking on the server. Please try again.', order: null, keyId: null, bookingId: null };
  }

  // 2. Create Razorpay order
  try {
    // Keys are already validated above, so we can safely use them.
    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    
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
