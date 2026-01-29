
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
  prompt: `You are "Devbhoomi Dost," a master travel guide for Uttarakhand.
A traveler has provided their preferences. Your task is to return a single, perfect travel suggestion in a valid JSON format.

## Traveler's Preferences
- **Vibe:** {{{travelVibe}}}
- **Traveling with:** {{{travelerType}}}
- **Atmosphere:** {{{atmosphere}}}

## Your Instructions
1.  **Analyze Preferences:** Based on the traveler's input, select ONE ideal location in Uttarakhand.
    -   For 'peace', suggest serene, lesser-known places (e.g., Mukteshwar, Kanatal, Chopta).
    -   For 'adventure', suggest places with activities (e.g., Rishikesh for rafting, Auli for skiing).
2.  **Generate Recommendation:** Construct a JSON object with the following fields:
    -   \`suggestedLocation\`: string - The name of the single recommended location.
    -   \`reasoning\`: string - A short, compelling paragraph explaining why this place is a perfect match.
    -   \`accommodationType\`: string - A suitable type of stay (e.g., "Cozy Homestay," "Riverside Camp," "Luxury Boutique Hotel").
    -   \`silentZoneScore\`: integer - A score from 0 (most crowded) to 10 (complete silence).
    -   \`bestTimeToVisit\`: string - The ideal months for a visit (e.g., "March to June").
    -   \`devtaConnectTip\`: string (optional) - ONLY if \`atmosphere\` is 'spiritual', provide a unique tip about a local temple or ritual. Otherwise, this field MUST be omitted.

## CRITICAL: Output Format
- Your entire response MUST be a single, valid JSON object.
- Do NOT include any text, markdown, or any characters before or after the JSON object.
- Ensure the \`silentZoneScore\` is an integer.

## Example
If the input is for a spiritual vibe, the output should look like this:
{
  "suggestedLocation": "Jageshwar",
  "reasoning": "For a spiritual seeker who loves to be away from the crowd, Jageshwar offers a tranquil atmosphere with its ancient temple complex surrounded by dense deodar forests. It's a place for introspection and peace.",
  "accommodationType": "Serene Ashram Stay",
  "silentZoneScore": 9,
  "bestTimeToVisit": "October to April",
  "devtaConnectTip": "Meditate at the Dandeshwar temple complex, which is even older and more peaceful than the main Jageshwar group."
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
