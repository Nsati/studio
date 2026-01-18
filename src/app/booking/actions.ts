
'use server';

import {
  generateBookingConfirmationEmail,
  type GenerateBookingConfirmationEmailInput,
  type GenerateBookingConfirmationEmailOutput,
} from '@/ai/flows/generate-booking-confirmation-email';


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
