
'use server';

import crypto from 'crypto';
import Razorpay from 'razorpay';
import shortid from 'shortid';
import {
  generateBookingConfirmationEmail,
  type GenerateBookingConfirmationEmailInput,
  type GenerateBookingConfirmationEmailOutput,
} from '@/ai/flows/generate-booking-confirmation-email';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Creates a Razorpay order.
 * @param amount The amount in the smallest currency unit (e.g., paisa for INR).
 * @returns A promise that resolves to the Razorpay order object.
 */
export async function createRazorpayOrder(amount: number) {
  const options = {
    amount: amount, // amount in the smallest currency unit
    currency: 'INR',
    receipt: shortid.generate(),
  };

  try {
    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return { success: false, error: 'Could not create order.' };
  }
}

/**
 * Verifies a Razorpay payment signature.
 * @param data The payment data from Razorpay checkout.
 * @returns A promise that resolves to an object indicating if the payment is verified.
 */
export async function verifyRazorpayPayment(data: {
  order_id: string;
  payment_id: string;
  signature: string;
}) {
  const { order_id, payment_id, signature } = data;
  const body = order_id + '|' + payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === signature;

  if (isAuthentic) {
    return { success: true, isVerified: true };
  } else {
    return { success: false, isVerified: false, error: 'Payment verification failed.' };
  }
}


export async function generateConfirmationEmailAction(
  input: GenerateBookingConfirmationEmailInput
): Promise<GenerateBookingConfirmationEmailOutput> {
  try {
    const output = await generateBookingConfirmationEmail(input);
    return output;
  } catch (error) {
    console.error('Error generating confirmation email:', error);
    // Return a fallback email in case of an error
    return {
      subject: `Booking Confirmation: ${input.bookingId}`,
      body: `<p>Thank you for your booking. Your booking ID is ${input.bookingId}.</p>`,
    };
  }
}
