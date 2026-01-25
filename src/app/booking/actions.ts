'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Environment variable checks
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

let razorpayInstance: Razorpay | null = null;
if (keyId && keySecret) {
    try {
        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    } catch(error) {
        console.error("Failed to initialize Razorpay instance:", error);
    }
} else {
    // This warning is crucial for debugging.
    if (process.env.NODE_ENV === 'development') {
        console.warn("⚠️ Razorpay KEY_ID or KEY_SECRET is not set in .env. The payment gateway will not function.");
    }
}

/**
 * Creates a Razorpay order.
 * This is a server action and should only be called from a 'use client' component.
 */
export async function createRazorpayOrder(amount: number, notes: Record<string, string | undefined>) {

  if (!razorpayInstance) {
    return { success: false, error: 'Payment gateway is not configured correctly on the server.', order: null, keyId: null };
  }

  // Ensure amount is an integer and at least 1 Rupee (100 paise)
  const amountInPaise = Math.round(amount * 100);
  if (amountInPaise < 100) {
      return { success: false, error: 'Order amount must be at least ₹1.00', order: null, keyId: null };
  }

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: notes.booking_id, // Use booking_id as the unique receipt
    notes: notes,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    if (!order) {
      return { success: false, error: 'Failed to create order with Razorpay.', order: null, keyId: null };
    }
    return { success: true, order, keyId, error: null };
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error);
    return { success: false, error: error.message || 'An unknown error occurred while creating the payment order.', order: null, keyId: null };
  }
}


/**
 * Verifies a Razorpay payment signature.
 * This is a server action.
 */
export async function verifyRazorpaySignature(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
    if (!webhookSecret) {
        console.error("RAZORPAY_WEBHOOK_SECRET is not set. Cannot verify signature.");
        return { success: false, error: "Server configuration error: Webhook secret is missing." };
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
