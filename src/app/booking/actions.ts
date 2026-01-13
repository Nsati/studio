
'use server';

import Razorpay from 'razorpay';
import shortid from 'shortid';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(amount: number, receipt: string) {
  const options = {
    amount: amount * 100, // Amount in the smallest currency unit (paise)
    currency: 'INR',
    receipt: receipt || shortid.generate(),
  };

  try {
    const order = await razorpay.orders.create(options);
    if (!order) {
      throw new Error('Order creation failed');
    }
    return { success: true, order };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    // In a real app, log this error to a monitoring service
    return { success: false, error: 'Could not create payment order.' };
  }
}
