'use server';
/**
 * @fileOverview The AI flow for the Devbhoomi Vibe Match™ feature.
 *
 * - getVibeMatchSuggestionAction - A Server Action that calls the AI to get a travel suggestion.
 * - VibeMatchInput - The input type for the user's preferences.
 * - VibeMatchOutput - The structured travel recommendation returned by the AI.
 */

import { ai } from '@/ai/genkit';
import {
  VibeMatchInputSchema,
  VibeMatchOutputSchema,
} from '@/app/vibe-match/schema';
import type { VibeMatchInput, VibeMatchOutput } from '@/app/vibe-match/schema';

export type { VibeMatchInput, VibeMatchOutput };

// Type for the server action's return value
type VibeMatchResult = {
  success: boolean;
  data: VibeMatchOutput | null;
  error?: string;
};

// The AI Prompt that defines the "Devbhoomi Dost" persona.
// By providing an `output.schema`, we instruct Genkit to handle the JSON formatting and validation.
// This is far more reliable than manually parsing JSON from a text response.
const suggestionPrompt = ai.definePrompt({
  name: 'vibeMatchPrompt',
  input: { schema: VibeMatchInputSchema },
  output: { schema: VibeMatchOutputSchema },
  config: {
    model: 'gemini-pro',
  },
  prompt: `You are "Devbhoomi Dost," a friendly local travel guide from Uttarakhand, India. Your tone is warm, friendly, and like a local dost (friend).

A traveler has given you their preferences. Your task is to act as their trusted guide and suggest the perfect Uttarakhand trip based on their vibe.

## Traveler's Vibe
- **Mood:** {{{travelVibe}}}
- **Company:** {{{travelerType}}}
- **Preference:** {{{atmosphere}}}

Based on this, generate a response that matches the provided JSON output schema. The Zod schema descriptions will guide you on what to put in each field.
`,
});


// The Genkit flow that orchestrates the AI call.
// This is now much simpler as Genkit handles the structured output automatically.
const vibeMatchFlow = ai.defineFlow(
  {
    name: 'vibeMatchFlow',
    inputSchema: VibeMatchInputSchema,
    outputSchema: VibeMatchOutputSchema,
  },
  async (input) => {
    const { output } = await suggestionPrompt(input);

    if (!output) {
      throw new Error('AI returned an empty or invalid suggestion.');
    }
    
    // The output is already parsed and validated by Genkit against VibeMatchOutputSchema
    return output;
  }
);


/**
 * The Server Action that is called from the client.
 * @param input The user's travel preferences.
 * @returns A result object containing the AI's suggestion or an error.
 */
export async function getVibeMatchSuggestionAction(
  input: VibeMatchInput
): Promise<VibeMatchResult> {
  try {
    const suggestion = await vibeMatchFlow(input);
    return { success: true, data: suggestion };
  } catch (error: any) {
    console.error('Vibe Match Action Error:', error);
    // Provide a user-friendly error message
    return {
      success: false,
      data: null,
      error:
        "Sorry, I couldn't come up with a suggestion right now. Please try again.",
    };
  }
}
