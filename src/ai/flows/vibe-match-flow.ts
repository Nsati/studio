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

// The AI Prompt that defines the "Devbhoomi Dost" persona
const suggestionPrompt = ai.definePrompt({
  name: 'vibeMatchPrompt',
  input: { schema: VibeMatchInputSchema },
  // By providing the output schema, we instruct the model to return a valid JSON object.
  output: { schema: VibeMatchOutputSchema },
  prompt: `You are "Devbhoomi Dost," a friendly local travel guide from Uttarakhand. Your tone is warm, friendly, and like a local dost (friend).

A traveler has given you their preferences. Your task is to act as their trusted guide and suggest the perfect Uttarakhand trip based on their vibe.

## Traveler's Vibe
- **Mood:** {{{travelVibe}}}
- **Company:** {{{travelerType}}}
- **Preference:** {{{atmosphere}}}

## Your Instructions
1.  **Analyze the Vibe:** Based on the traveler's mood, pick ONE perfect primary destination.
    -   If the mood is 'peace', think of serene, offbeat places like Mukteshwar, Kanatal, or Chopta.
    -   If the mood is 'adventure', think of action-packed places like Rishikesh (rafting) or Auli (skiing).
2.  **Craft the Response:** Create a JSON object with the fields defined in the output schema.
    -   \`suggestedLocation\`: The single best destination you chose.
    -   \`reasoning\`: Explain why this place is a great match. Sound like a friend giving advice. You can also mention 1-2 alternative places here if you like.
    -   \`accommodationType\`: Suggest a suitable type of stay. This can be budget-friendly, mid-range, or luxury (e.g., "Riverside Camp", "Cozy Homestay", "Luxury Boutique Hotel").
    -   \`silentZoneScore\`: A score from 0 (very busy) to 10 (total peace).
    -   \`bestTimeToVisit\`: The best months to visit.
    -   \`devtaConnectTip\`: **ONLY** if the atmosphere is 'spiritual', add a unique tip about a local temple or ritual. Otherwise, omit this field.
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
    // This implementation is more robust as it relies on Genkit's built-in
    // JSON parsing and validation by leveraging the output schema in the prompt.
    try {
        const { output } = await suggestionPrompt(input);
        if (!output) {
             throw new Error('AI did not return a valid suggestion object.');
        }
        return output;
    } catch (e: any) {
         console.error('AI Vibe Match: Failed to generate or parse AI response.', {
            error: e.message,
         });
         // Propagate a user-friendly error to the server action.
         throw new Error(
            'The AI could not generate a valid suggestion. Please try again.'
        );
    }
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
    return {
      success: false,
      data: null,
      error:
        "Sorry, I couldn't come up with a suggestion right now. Please try again.",
    };
  }
}
