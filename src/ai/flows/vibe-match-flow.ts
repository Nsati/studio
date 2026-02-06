
'use server';
/**
 * @fileOverview The AI flow for the Tripzy Vibe Match™ feature.
 * Hardened to resolve 404 model errors and ensure production stability.
 */

import { ai } from '@/ai/genkit';
import {
  VibeMatchInputSchema,
  VibeMatchOutputSchema,
} from '@/app/vibe-match/schema';
import type { VibeMatchInput, VibeMatchOutput } from '@/app/vibe-match/schema';

export type { VibeMatchInput, VibeMatchOutput };

type VibeMatchResult = {
  success: boolean;
  data: VibeMatchOutput | null;
  error?: string;
};

const suggestionPrompt = ai.definePrompt({
  name: 'vibeMatchPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: VibeMatchInputSchema },
  output: { schema: VibeMatchOutputSchema },
  prompt: `You are a professional travel curator for Tripzy, specialized in Uttarakhand.
Respond ONLY with a valid JSON object following the schema.

User Vibe:
- Mood: {{{travelVibe}}}
- Traveling with: {{{travelerType}}}
- Atmosphere: {{{atmosphere}}}

Suggest a destination in Uttarakhand that fits this vibe perfectly. Mention specific local spots or unique stay types if possible.`,
});

const vibeMatchFlow = ai.defineFlow(
  {
    name: 'vibeMatchFlow',
    inputSchema: VibeMatchInputSchema,
    outputSchema: VibeMatchOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await suggestionPrompt(input);
      if (!output) throw new Error('AI failed to generate a matching vibe.');
      return output;
    } catch (e: any) {
      console.error('Gemini Execution Error:', e);
      throw e;
    }
  }
);

export async function getVibeMatchSuggestionAction(
  input: VibeMatchInput
): Promise<VibeMatchResult> {
  try {
    const suggestion = await vibeMatchFlow(input);
    return { success: true, data: suggestion };
  } catch (error: any) {
    console.error('Vibe Match AI Error:', error);
    return {
      success: false,
      data: null,
      error: "The Tripzy AI Expert is taking a short mountain walk. Please try again soon.",
    };
  }
}
