'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a booking confirmation email.
 *
 * The flow takes in booking details and outputs a generated email subject and body.
 *
 * @interface GenerateBookingConfirmationEmailInput - Defines the input schema for the flow.
 * @interface GenerateBookingConfirmationEmailOutput - Defines the output schema for the flow.
 * @function generateBookingConfirmationEmail - The main function to trigger the email generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { format } from 'date-fns';

const GenerateBookingConfirmationEmailInputSchema = z.object({
  hotelName: z.string().describe('The name of the hotel.'),
  customerName: z.string().describe('The name of the customer.'),
  checkIn: z.string().describe('The check-in date in ISO format.'),
  checkOut: z.string().describe('The check-out date in ISO format.'),
  roomType: z.string().describe('The type of room booked.'),
  totalPrice: z.number().describe('The total price of the booking.'),
  bookingId: z.string().describe('The unique ID of the booking.'),
});

export type GenerateBookingConfirmationEmailInput = z.infer<
  typeof GenerateBookingConfirmationEmailInputSchema
>;

const GenerateBookingConfirmationEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The HTML body content of the email.'),
});

export type GenerateBookingConfirmationEmailOutput = z.infer<
  typeof GenerateBookingConfirmationEmailOutputSchema
>;

export async function generateBookingConfirmationEmail(
  input: GenerateBookingConfirmationEmailInput
): Promise<GenerateBookingConfirmationEmailOutput> {
  return generateBookingConfirmationEmailFlow(input);
}

const generateBookingConfirmationEmailPrompt = ai.definePrompt({
  name: 'generateBookingConfirmationEmailPrompt',
  input: { schema: GenerateBookingConfirmationEmailInputSchema },
  output: { schema: GenerateBookingConfirmationEmailOutputSchema },
  prompt: `
You are an expert email copywriter for a luxury hotel chain called "Uttarakhand Getaways".
Your task is to generate a warm, professional, and informative booking confirmation email.

The user has just completed a booking. Generate an email with a subject and an HTML body.

**Booking Details:**
- Hotel Name: {{hotelName}}
- Customer Name: {{customerName}}
- Check-in Date: {{checkIn}}
- Check-out Date: {{checkOut}}
- Room Type: {{roomType}} Room
- Total Price Paid: ₹{{totalPrice}}
- Booking ID: {{bookingId}}

**Instructions for the email:**
1.  **Subject Line:** Create a clear and exciting subject line, like "Your Himalayan Adventure Awaits! Booking Confirmation for {{hotelName}}".
2.  **Email Body (HTML):**
    - Start with a personal greeting to the customer (e.g., "Dear {{customerName}},").
    - Thank them for booking with "Uttarakhand Getaways".
    - Clearly and beautifully summarize the booking details. Use a simple, elegant table or a formatted list.
    - Mention that this is a confirmation of their payment and booking.
    - Include a warm closing, like "We look forward to welcoming you."
    - End with "Sincerely, The Team at {{hotelName}}".
    - Do not include any images or complex CSS. Use basic HTML tags like <p>, <strong>, <ul>, <li>, <h2>.
    - Format dates to be human-readable (e.g., "August 10, 2024"). The input dates are in ISO format.
  `,
});

const generateBookingConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'generateBookingConfirmationEmailFlow',
    inputSchema: GenerateBookingConfirmationEmailInputSchema,
    outputSchema: GenerateBookingConfirmationEmailOutputSchema,
  },
  async (input: GenerateBookingConfirmationEmailInput) => {
    // Format dates before sending to the prompt for better processing
    const formattedInput = {
      ...input,
      checkIn: format(new Date(input.checkIn), 'PPP'),
      checkOut: format(new Date(input.checkOut), 'PPP'),
    };

    const { output } = await generateBookingConfirmationEmailPrompt(formattedInput);
    return output!;
  }
);
