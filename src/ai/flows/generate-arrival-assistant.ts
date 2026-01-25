'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a smart trip assistant guide.
 *
 * The flow takes booking and hotel details and outputs a helpful, structured guide for the user's trip.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TripAssistantInputSchema = z.object({
  hotelName: z.string().describe('The name of the hotel.'),
  hotelCity: z.string().describe('The city where the hotel is located.'),
  hotelAddress: z.string().optional().describe('The full street address of the hotel, if available.'),
  customerName: z.string().describe("The customer's name."),
  checkInDate: z.string().describe('The check-in date for the booking, in a human-readable format (e.g., "Saturday, August 24, 2024").'),
});

export type TripAssistantInput = z.infer<typeof TripAssistantInputSchema>;

const TripAssistantOutputSchema = z.object({
  welcomeMessage: z.string().describe("A warm, personal welcome message for the guest, building excitement for their trip."),
  googleMapsUrl: z.string().url().describe("A Google Maps URL to navigate to the hotel."),
  parkingInfo: z.string().describe("Brief, helpful advice about parking at or near the hotel."),
  checkInReminder: z.string().describe("A reminder about the check-in time and what documents to bring."),
  localTip: z.string().describe("A unique and interesting local tip about something to do or see near the hotel in that city."),
  suggestedActivity: z.string().describe("A suggested activity or excursion based on the hotel's city, like river rafting or a jungle safari."),
  localCuisineRecommendation: z.string().describe("A recommendation for a specific local dish to try and a brief description of it."),
});

export type TripAssistantOutput = z.infer<typeof TripAssistantOutputSchema>;

export async function generateTripGuide(
  input: TripAssistantInput
): Promise<TripAssistantOutput> {
  // Add a guard to prevent calling the flow if AI is not configured.
  if (!ai.model) {
    throw new Error('AI model is not configured. Please set GEMINI_API_KEY in your .env file.');
  }
  return tripAssistantFlow(input);
}

const tripAssistantPrompt = ai.definePrompt({
  name: 'tripAssistantPrompt',
  input: { schema: TripAssistantInputSchema },
  output: { schema: TripAssistantOutputSchema },
  prompt: `
You are a "Smart Trip Assistant" for Uttarakhand Getaways. Your goal is to provide a helpful, friendly, and comprehensive guide for a guest who has just booked a hotel. You are like a personal travel concierge.

**Guest and Booking Details:**
- Guest Name: {{customerName}}
- Hotel Name: {{hotelName}}
- City: {{hotelCity}}
- Hotel Address: {{#if hotelAddress}}{{hotelAddress}}{{else}}Not specified{{/if}}
- Check-in Date: {{checkInDate}}

**Your Task:**
Generate a structured response with the following information. Be creative, warm, and genuinely helpful. Your tone should be that of an expert local friend.

1.  **welcomeMessage:** Write a short, personalized welcome message for {{customerName}}. Mention their upcoming stay at {{hotelName}} and build excitement for their trip to {{hotelCity}}.
2.  **googleMapsUrl:** Create a Google Maps navigation link.
    - If a full hotelAddress is provided, use it to create a specific search URL: \`https://www.google.com/maps/search/?api=1&query=...\` (URL-encode the address).
    - If the address is not specified, create a more general search URL for the hotel name and city: \`https://www.google.com/maps/search/?api=1&query={{hotelName}},%20{{hotelCity}}\`.
3.  **parkingInfo:** Provide plausible and helpful parking advice. For example, "The hotel offers complimentary on-site parking for guests." or "Limited street parking is available, we recommend arriving early to find a spot."
4.  **checkInReminder:** Remind the guest that check-in is typically after 2:00 PM on {{checkInDate}}. Also, remind them to bring a valid government-issued photo ID.
5.  **localTip:** Provide ONE unique and insightful local tip for {{hotelCity}}. Avoid generic advice. For example, for Nainital, instead of "go boating", suggest "Try the 'bal mithai' at a local sweet shop on Mall Road for an authentic Kumaoni treat." For Rishikesh, suggest "Don't miss the evening Ganga Aarti at Triveni Ghat for a less crowded but equally mesmerizing experience."
6.  **suggestedActivity:** Based on {{hotelCity}}, suggest a relevant and exciting activity. For Rishikesh, suggest river rafting. For Auli, suggest skiing or the cable car ride. For Jim Corbett, suggest a jungle safari. Make it sound appealing.
7.  **localCuisineRecommendation:** Recommend a specific local dish from the region (Kumaoni or Garhwali cuisine) that the guest must try. Briefly describe it and mention the kind of places they might find it (e.g., "Look for local dhabas..."). For example: "You must try 'Kafuli', a delicious spinach-based gravy, best enjoyed with hot rice."
`,
});

const tripAssistantFlow = ai.defineFlow(
  {
    name: 'tripAssistantFlow',
    inputSchema: TripAssistantInputSchema,
    outputSchema: TripAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await tripAssistantPrompt(input);
    return output!;
  }
);
