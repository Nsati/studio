
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Creates a Razorpay order.
 * This is a server action and should only be called from a 'use client' component.
 * This version is hardened to prevent crashes and always return a structured response.
 */
export async function createRazorpayOrder(amount: number, notes: Record<string, string | undefined>) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return { success: false, error: 'Payment gateway is not configured on the server. Missing API keys.', order: null, keyId: null };
    }
    
    if (typeof amount !== 'number' || isNaN(amount)) {
      return { success: false, error: `Invalid order amount provided. Expected a number.`, order: null, keyId: null };
    }

    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 100) {
        return { success: false, error: 'Order amount must be at least ₹1.00', order: null, keyId: null };
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_booking_${notes.booking_id}`,
      notes: notes,
    };
    
    const order = await razorpayInstance.orders.create(options);
    
    if (!order) {
      // This case is unlikely as .create() would throw on failure, but it's a safe fallback.
      return { success: false, error: 'Failed to create order with Razorpay. The order object was null.', order: null, keyId: null };
    }
    
    return { success: true, order, keyId, error: null };

  } catch (error: any) {
    // Ensure that any and all errors are caught and returned as a structured JSON response.
    const errorMessage = error.message || 'An unknown error occurred during payment processing.';
    return { success: false, error: errorMessage, order: null, keyId: null };
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
