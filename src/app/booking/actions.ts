'use server';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import type { Booking, Hotel, Room } from '@/lib/types';

const Razorpay = require('razorpay');
import crypto from 'crypto';

// --- Server-side CLIENT SDK initialization for server actions ---
// We use this for actions directly called from the client to respect security rules.
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const firestore = getFirestore(app);
// ---

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

export async function verifyRazorpayPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerifyPaymentResponse> {
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

  if (expectedSignature === razorpay_signature) {
    return { success: true };
  } else {
    console.warn('Payment verification failed: Signatures do not match.');
    return { success: false, error: 'Payment verification failed.' };
  }
}

export async function createPendingBooking(bookingDetails: {
  hotel: Hotel;
  room: Room;
  checkIn: Date;
  checkOut: Date;
  guests: string;
  totalPrice: number;
  customerDetails: { name: string; email: string };
  userId: string;
}): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  const {
    hotel,
    room,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    customerDetails,
    userId,
  } = bookingDetails;
  const newBookingId = `booking_${Date.now()}`;

  try {
    const bookingRef = doc(firestore, 'users', userId, 'bookings', newBookingId);

    const bookingData: Booking = {
      id: newBookingId,
      hotelId: hotel.id,
      userId: userId,
      roomId: room.id,
      roomType: room.type,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: parseInt(guests),
      totalPrice: totalPrice,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      status: 'PENDING', // Set status to PENDING
      createdAt: new Date(),
    };
    await setDoc(bookingRef, bookingData);
    return { success: true, bookingId: newBookingId };
  } catch (e: any) {
    console.error('Error creating pending booking:', e);
    return { success: false, error: 'Could not initialize booking.' };
  }
}
