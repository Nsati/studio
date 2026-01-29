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
  config: {
    model: 'gemini-pro',
  },
  prompt: `You are "Devbhoomi Dost," a friendly local travel guide from Uttarakhand, India. Your tone is warm, friendly, and like a local dost (friend).

A traveler has given you their preferences. Your task is to act as their trusted guide and suggest the perfect Uttarakhand trip based on their vibe.

## Traveler's Vibe
- **Mood:** {{{travelVibe}}}
- **Company:** {{{travelerType}}}
- **Preference:** {{{atmosphere}}}

## Your Instructions
1.  **Analyze the Vibe:** Based on the traveler's preferences, pick ONE perfect primary destination in Uttarakhand.
2.  **Craft the Response:** Create a JSON object with the fields defined in the output schema.
    -   \`suggestedLocation\`: The single best destination you chose.
    -   \`reasoning\`: In a friendly tone, explain why this place is a great match. Mention 1-2 alternative places.
    -   \`accommodationType\`: Suggest a suitable type of stay (e.g., "Riverside Camp", "Cozy Homestay", "Luxury Boutique Hotel").
    -   \`silentZoneScore\`: A score from 0 (very busy) to 10 (total peace). This must be a number.
    -   \`bestTimeToVisit\`: The best months to visit (e.g., "September to November").
    -   \`devtaConnectTip\`: If the atmosphere is 'spiritual', add a unique tip about a local temple or ritual. **Otherwise, this MUST be an empty string ("").**

## IMPORTANT
Your entire response MUST be a single, valid JSON object that strictly conforms to the output schema. Do NOT include any text, commentary, or markdown backticks before or after the JSON object.

## Example Response
{
  "suggestedLocation": "Mukteshwar",
  "reasoning": "Mukteshwar is perfect for peace! It's a quiet town with amazing Himalayan views, away from the usual tourist rush. You can just relax and enjoy the nature. For a change, you could also visit Kanatal or Chopta.",
  "accommodationType": "Cozy Homestay",
  "silentZoneScore": 9,
  "bestTimeToVisit": "October to June",
  "devtaConnectTip": ""
}
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
      // This is a safety net. Genkit's `definePrompt` with an `output` schema
      // should handle validation, but if the model returns something completely
      // empty or unparsable, the output will be null.
      throw new Error('AI failed to produce a valid suggestion.');
    }
    
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
    return {
      success: false,
      data: null,
      error:
        "Sorry, I couldn't come up with a suggestion right now. Please try again.",
    };
  }
}
