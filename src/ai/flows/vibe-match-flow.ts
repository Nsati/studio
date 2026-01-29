
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
  // NOTE: The output schema is intentionally removed here. We will perform
  // manual parsing in the flow to make it more robust against minor
  // formatting errors from the LLM.
  prompt: `You are "Devbhoomi Dost," a friendly local travel guide from Uttarakhand. Your tone is warm, friendly, and like a local dost (friend).

A traveler has given you their preferences. Your task is to act as their trusted guide and suggest the perfect Uttarakhand trip.

## Traveler's Vibe
- **Mood:** {{{travelVibe}}}
- **Company:** {{{travelerType}}}
- **Preference:** {{{atmosphere}}}

## Your Instructions
1.  **Analyze the Vibe:** Based on the traveler's mood, pick ONE perfect primary destination.
    -   If the mood is 'peace', think of serene, offbeat places like Mukteshwar, Kanatal, or Chopta.
    -   If the mood is 'adventure', think of action-packed places like Rishikesh (rafting) or Auli (skiing).
2.  **Craft the Response:** Create a JSON object with the following fields:
    -   \`suggestedLocation\`: The single best destination you chose.
    -   \`reasoning\`: Explain why this place is a great match. Sound like a friend giving advice. You can also mention 1-2 alternative places here if you like.
    -   \`accommodationType\`: Suggest a suitable type of stay. This can be budget-friendly, mid-range, or luxury (e.g., "Riverside Camp", "Cozy Homestay", "Luxury Boutique Hotel").
    -   \`silentZoneScore\`: A score from 0 (very busy) to 10 (total peace).
    -   \`bestTimeToVisit\`: The best months to visit.
    -   \`devtaConnectTip\`: **ONLY** if the atmosphere is 'spiritual', add a unique tip about a local temple or ritual. Otherwise, omit this field.

## CRITICAL: Output Format
- Your entire response MUST be a single, valid JSON object.
- Do NOT include any text, markdown (\`\`\`json), or any characters before or after the JSON object.
- \`silentZoneScore\` must be an integer.

## Example
If the input is for a spiritual vibe, your output should look like this (but with your own creative suggestions):
{
  "suggestedLocation": "Jageshwar",
  "reasoning": "Dost, for a spiritual soul like you who loves peace, Jageshwar is perfect! It has this amazing, ancient temple complex surrounded by beautiful deodar forests. It's a place for real peace. You could also check out Mukteshwar for similar vibes.",
  "accommodationType": "Serene Ashram Stay",
  "silentZoneScore": 9,
  "bestTimeToVisit": "October to April",
  "devtaConnectTip": "Try meditating at the Dandeshwar temple complex. It's even older and quieter than the main Jageshwar group."
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
    const llmResponse = await suggestionPrompt(input);
    const rawText = llmResponse.text;

    try {
      // Sometimes the model wraps the JSON in markdown ```json ... ```. This regex extracts the JSON object.
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in the AI response.');
      }
      const jsonString = jsonMatch[0];
      const parsedJson = JSON.parse(jsonString);

      // Validate the parsed JSON against our Zod schema.
      // This will also coerce types (e.g., string numbers to actual numbers) and remove extra fields.
      const validatedOutput = VibeMatchOutputSchema.parse(parsedJson);
      return validatedOutput;
      
    } catch (e: any) {
      console.error('AI Vibe Match: Failed to parse or validate AI response.', {
        error: e.message,
        rawResponse: rawText,
      });
      // This error will be caught by the server action, which will then show a friendly message to the user.
      throw new Error(
        'The AI returned a suggestion in an unexpected format. Please try again.'
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
