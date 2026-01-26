
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Creates a Razorpay order.
 * This is a server action and should only be called from a 'use client' component.
 */
export async function createRazorpayOrder(amount: number, notes: Record<string, string | undefined>) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay KEY_ID or KEY_SECRET is not set in .env.");
    return { success: false, error: 'Payment gateway is not configured correctly on the server.', order: null, keyId: null };
  }

  try {
    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

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
