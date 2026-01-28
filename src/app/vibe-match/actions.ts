'use server';

import { ai } from '@/ai/genkit';
import { 
    VibeMatchInputSchema, 
    VibeMatchOutputSchema
} from './schema';
import type { VibeMatchInput, VibeMatchOutput } from './schema';

type VibeMatchResult = {
    success: boolean;
    data: VibeMatchOutput | null;
    error?: string;
}

// The AI Prompt that defines the "Devbhoomi Dost" persona
const suggestionPrompt = ai.definePrompt({
    name: 'vibeMatchPrompt',
    input: { schema: VibeMatchInputSchema },
    output: { schema: VibeMatchOutputSchema },
    prompt: `You are 'Devbhoomi Dost', an expert travel guide for Uttarakhand with deep local knowledge. Your goal is to give personalized, honest, and practical advice.

A user is asking for a travel recommendation based on their mood.

User's preferences:
- Vibe: {{{travelVibe}}}
- Traveling with: {{{travelerType}}}
- Desired Atmosphere: {{{atmosphere}}}

Your task:
1.  Based on their preferences, suggest ONE primary location in Uttarakhand. Avoid mainstream, overcrowded places like Mussoorie or Nainital during peak season unless the user's vibe is adventure. Suggest hidden gems.
2.  Provide a short, friendly reason for your suggestion. Mention things like crowd levels, scenery, or unique experiences.
3.  Recommend a suitable type of accommodation (e.g., "Boutique Hotel", "Cozy Homestay", "Riverside Camp").
4.  Give the location a "Silent Zone Score" from 0 (total tourist chaos) to 10 (pure Himalayan silence).
5.  Suggest the best months to visit.
6.  If the user's desired atmosphere is 'spiritual', provide a 'Devta Connect Tip' - a short, insightful tip about a local temple, ritual, or spiritual spot that isn't widely known.
`,
});

// The Genkit flow that orchestrates the AI call
const vibeMatchFlow = ai.defineFlow(
  {
    name: 'vibeMatchFlow',
    inputSchema: VibeMatchInputSchema,
    outputSchema: VibeMatchOutputSchema,
  },
  async (input) => {
    const { output } = await suggestionPrompt(input);
    if (!output) {
        throw new Error("The AI could not generate a suggestion. Please try again.");
    }
    return output;
  }
);

/**
 * Server action to get an AI-powered travel suggestion.
 * This function is called from the client and executes on the server.
 *
 * @param input The user's preferences for their trip.
 * @returns A result object containing the AI's suggestion or an error.
 */
export async function getVibeMatchSuggestionAction(input: VibeMatchInput): Promise<VibeMatchResult> {
    try {
        const suggestion = await vibeMatchFlow(input);
        return { success: true, data: suggestion };
    } catch (error: any) {
        console.error("Vibe Match Action Error:", error);
        return { success: false, data: null, error: "Sorry, I couldn't come up with a suggestion right now. Please try again." };
    }
}
