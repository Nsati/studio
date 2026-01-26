
'use server';

import Razorpay from 'razorpay';

/**
 * Creates a Razorpay order.
 * This server action is now simplified to only handle payment gateway interaction.
 * It has no dependency on the Firebase Admin SDK.
 * It includes the bookingId and userId in the notes for the webhook to use.
 */
export async function createRazorpayOrder(
  totalPrice: number,
  bookingId: string,
  userId: string
) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const errorMessage =
      'Payment processing is currently unavailable. (Admin Error: Razorpay keys are missing).';
    console.error(`SERVER ACTION ERROR: ${errorMessage}`);
    return { success: false, error: errorMessage, order: null, keyId: null };
  }

  try {
    const razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const amountInPaise = Math.round(totalPrice * 100);

    if (amountInPaise < 100) {
      throw new Error('Order amount must be at least ₹1.00');
    }

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      notes: { 
        booking_id: bookingId,
        user_id: userId,
      },
    };

    const order = await razorpayInstance.orders.create(orderOptions);
    if (!order) throw new Error('Failed to create order with Razorpay.');

    return { success: true, order, keyId, error: null };
  } catch (error: any) {
    console.error('SERVER ACTION ERROR: Failed to create Razorpay order:', error);
    return {
      success: false,
      error: error.message || 'An unknown server error occurred.',
      order: null,
      keyId: null,
    };
  }
}
