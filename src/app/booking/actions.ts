
'use server';

import {
  generateBookingConfirmationEmail,
  type GenerateBookingConfirmationEmailInput,
  type GenerateBookingConfirmationEmailOutput,
} from '@/ai/flows/generate-booking-confirmation-email';


/**
 * This function simulates a payment gateway interaction.
 * It's for demo purposes only and should be replaced with a real
 * payment gateway integration (e.g., Stripe, Razorpay) in production.
 *
 * @param amount The amount to "charge".
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function simulatePayment(amount: number) {
  // 1. Simulate API delay to feel like a real transaction.
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 2. Simulate payment success/failure.
  // In a real demo, you might want this to be a toggle or a predictable value.
  const isSuccess = Math.random() > 0.2; // 80% success rate

  if (!isSuccess) {
    console.log(`Dummy payment of ${amount} failed.`);
    return { success: false, error: 'The payment was declined by your bank. Please try again.' };
  }

  // 3. Generate a fake transaction ID for the successful "payment".
  const fakeTransactionId = `DUMMY_PAY_${Date.now()}`;
  console.log(`Dummy payment of ${amount} successful. Transaction ID: ${fakeTransactionId}`);

  return { success: true, transactionId: fakeTransactionId };
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
