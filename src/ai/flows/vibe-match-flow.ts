'use server';
/**
 * @fileOverview The AI flow for the Devbhoomi Vibe Match™ feature.
 *
 * - getVibeSuggestion - A function that calls the AI to get a travel suggestion.
 */

import { ai } from '@/ai/genkit';
import { 
    VibeMatchInputSchema, 
    VibeMatchOutputSchema
} from '@/app/vibe-match/schema';
import type { VibeMatchInput, VibeMatchOutput } from '@/app/vibe-match/schema';

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
 * Calls the Vibe Match AI flow to get a travel suggestion.
 * @param input The user's travel preferences.
 * @returns A structured travel recommendation.
 */
export async function getVibeSuggestion(input: VibeMatchInput): Promise<VibeMatchOutput> {
  return vibeMatchFlow(input);
}
);
      }
      return output;
    }
  );
  
  return vibeMatchFlow(input);
}
