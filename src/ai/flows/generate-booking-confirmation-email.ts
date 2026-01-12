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
import { z } from 'genkit';

const GenerateBookingConfirmationEmailInputSchema = z.object({
  hotelName: z.string().describe('The name of the hotel.'),
  customerName: z.string().describe("The customer's name."),
  checkIn: z.string().describe('The check-in date (e.g., "August 20, 2024").'),
  checkOut: z.string().describe('The check-out date (e.g., "August 22, 2024").'),
  roomType: z.string().describe('The type of room booked (e.g., "Deluxe Room").'),
  guests: z.number().describe('The number of guests.'),
  totalPrice: z.number().describe('The total price of the booking.'),
  bookingId: z.string().describe('The unique ID for the booking.'),
});

export type GenerateBookingConfirmationEmailInput = z.infer<
  typeof GenerateBookingConfirmationEmailInputSchema
>;

const GenerateBookingConfirmationEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z
    .string()
    .describe(
      'The HTML body of the email. Use appropriate HTML tags like <p>, <strong>, <ul>, <li> to format the content.'
    ),
});

export type GenerateBookingConfirmationEmailOutput = z.infer<
  typeof GenerateBookingConfirmationEmailOutputSchema
>;

export async function generateBookingConfirmationEmail(
  input: GenerateBookingConfirmationEmailInput
): Promise<GenerateBookingConfirmationEmailOutput> {
  return generateBookingConfirmationEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookingConfirmationEmailPrompt',
  input: { schema: GenerateBookingConfirmationEmailInputSchema },
  output: { schema: GenerateBookingConfirmationEmailOutputSchema },
  prompt: `You are an expert hospitality copywriter. Generate a warm and professional booking confirmation email.

The tone should be welcoming and reassuring. The email must be in HTML format.

**Booking Details:**
- Hotel: {{hotelName}}
- Guest Name: {{customerName}}
- Booking ID: {{bookingId}}
- Check-in: {{checkIn}}
- Check-out: {{checkOut}}
- Room Type: {{roomType}}
- Guests: {{guests}}
- Total Paid: ₹{{totalPrice}}

**Instructions:**
1.  Create a clear and concise subject line, like "Your Booking at {{hotelName}} is Confirmed!".
2.  Start with a warm greeting to {{customerName}}.
3.  Confirm that their booking is successful.
4.  Summarize the key booking details in a clean, easy-to-read format (an HTML list '<ul>' is a good choice).
5.  Include a friendly closing, wishing them a pleasant stay.
6.  Mention the hotel name again in the closing.
7.  Do not include any unsubscribe links or marketing content.
8.  The entire output for the body must be a single block of HTML.
`,
});

const generateBookingConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'generateBookingConfirmationEmailFlow',
    inputSchema: GenerateBookingConfirmationEmailInputSchema,
    outputSchema: GenerateBookingConfirmationEmailOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
