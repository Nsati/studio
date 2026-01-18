'use server';

import crypto from 'crypto';
import Razorpay from 'razorpay';
import {
  generateBookingConfirmationEmail,
  type GenerateBookingConfirmationEmailInput,
  type GenerateBookingConfirmationEmailOutput,
} from '@/ai/flows/generate-booking-confirmation-email';


/**
 * Creates a Razorpay order.
 * @param amount The amount in the smallest currency unit (e.g., paisa for INR).
 * @returns A promise that resolves to the Razorpay order object.
 */
export async function createRazorpayOrder(amount: number) {
  // --- JUGAAD / WORKAROUND: Hardcoding keys to bypass environment variable issues for demo ---
  // WARNING: DO NOT USE THIS IN PRODUCTION.
  // In a real app, these should always come from secure environment variables (e.g., process.env).
  const keyId = 'rzp_test_eJ9v3b1X4qY5pX';
  const keySecret = 'T9pSg5nL2mR5zO8gE1fB0hJ7';

  if (!keyId || !keySecret) {
    console.error('Razorpay Key ID or Key Secret is not defined.');
    return { success: false, error: 'Payment gateway credentials are not configured.' };
  }
  
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const options = {
    amount: amount, // amount in the smallest currency unit
    currency: 'INR',
    receipt: `receipt_${crypto.randomBytes(8).toString('hex')}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return { success: true, order, keyId };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return { success: false, error: 'Could not create payment order. Check server logs for details.' };
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
  
  // --- JUGAAD / WORKAROUND: Hardcoding secret key to bypass environment variable issues for demo ---
  // WARNING: DO NOT USE THIS IN PRODUCTION.
  const keySecret = 'T9pSg5nL2mR5zO8gE1fB0hJ7';
  
  if (!keySecret) {
    console.error('Razorpay Key Secret is not defined.');
    return { success: false, isVerified: false, error: 'Payment verification is not configured.' };
  }
  
  const body = order_id + '|' + payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
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
