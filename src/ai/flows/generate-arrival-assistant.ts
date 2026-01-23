'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a smart arrival assistant guide.
 *
 * The flow takes booking and hotel details and outputs a helpful, structured guide for the user's arrival.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ArrivalAssistantInputSchema = z.object({
  hotelName: z.string().describe('The name of the hotel.'),
  hotelCity: z.string().describe('The city where the hotel is located.'),
  hotelAddress: z.string().optional().describe('The full street address of the hotel, if available.'),
  customerName: z.string().describe("The customer's name."),
  checkInDate: z.string().describe('The check-in date for the booking, in a human-readable format (e.g., "Saturday, August 24, 2024").'),
});

export type ArrivalAssistantInput = z.infer<typeof ArrivalAssistantInputSchema>;

const ArrivalAssistantOutputSchema = z.object({
  welcomeMessage: z.string().describe("A warm, personal welcome message for the guest."),
  googleMapsUrl: z.string().url().describe("A Google Maps URL to navigate to the hotel."),
  parkingInfo: z.string().describe("Brief, helpful advice about parking at or near the hotel."),
  checkInReminder: z.string().describe("A reminder about the check-in time and what documents to bring."),
  localTip: z.string().describe("A unique and interesting local tip about something to do or see near the hotel in that city."),
});

export type ArrivalAssistantOutput = z.infer<typeof ArrivalAssistantOutputSchema>;

export async function generateArrivalGuide(
  input: ArrivalAssistantInput
): Promise<ArrivalAssistantOutput> {
  return arrivalAssistantFlow(input);
}

const arrivalAssistantPrompt = ai.definePrompt({
  name: 'arrivalAssistantPrompt',
  input: { schema: ArrivalAssistantInputSchema },
  output: { schema: ArrivalAssistantOutputSchema },
  prompt: `
You are a "Smart Arrival Assistant" for Uttarakhand Getaways. Your goal is to provide a helpful and friendly guide for a guest who has just booked a hotel.

**Guest and Booking Details:**
- Guest Name: {{customerName}}
- Hotel Name: {{hotelName}}
- City: {{hotelCity}}
- Hotel Address: {{#if hotelAddress}}{{hotelAddress}}{{else}}Not specified{{/if}}
- Check-in Date: {{checkInDate}}

**Your Task:**
Generate a structured response with the following information. Be creative, warm, and genuinely helpful.

1.  **welcomeMessage:** Write a short, personalized welcome message for {{customerName}}. Mention their upcoming stay at {{hotelName}}.
2.  **googleMapsUrl:** Create a Google Maps navigation link.
    - If a full hotelAddress is provided, use it to create a specific search URL: \`https://www.google.com/maps/search/?api=1&query=...\` (URL-encode the address).
    - If the address is not specified, create a more general search URL for the hotel name and city: \`https://www.google.com/maps/search/?api=1&query={{hotelName}},%20{{hotelCity}}\`.
3.  **parkingInfo:** Provide plausible and helpful parking advice. For example, "The hotel offers complimentary on-site parking for guests." or "Limited street parking is available, we recommend arriving early to find a spot."
4.  **checkInReminder:** Remind the guest that check-in is typically after 2:00 PM on {{checkInDate}}. Also, remind them to bring a valid government-issued photo ID.
5.  **localTip:** Provide ONE unique and insightful local tip for {{hotelCity}}. Avoid generic advice. For example, for Nainital, instead of "go boating", suggest "Try the 'bal mithai' at a local sweet shop on Mall Road for an authentic Kumaoni treat." For Rishikesh, suggest "Don't miss the evening Ganga Aarti at Triveni Ghat for a less crowded but equally mesmerizing experience."
`,
});

const arrivalAssistantFlow = ai.defineFlow(
  {
    name: 'arrivalAssistantFlow',
    inputSchema: ArrivalAssistantInputSchema,
    outputSchema: ArrivalAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await arrivalAssistantPrompt(input);
    return output!;
  }
);
