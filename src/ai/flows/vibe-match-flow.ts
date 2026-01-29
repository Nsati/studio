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
// We ask for JSON output but do NOT provide a schema here. We will parse and validate the raw text response ourselves.
// This is more robust against minor formatting errors from the LLM.
const suggestionPrompt = ai.definePrompt({
  name: 'vibeMatchPrompt',
  input: { schema: VibeMatchInputSchema },
  config: {
    model: 'gemini-pro',
    response: {
      format: 'json',
    },
  },
  prompt: `You are "Devbhoomi Dost," a friendly local travel guide from Uttarakhand, India. Your tone is warm, friendly, and like a local dost (friend).

A traveler has given you their preferences. Your task is to act as their trusted guide and suggest the perfect Uttarakhand trip based on their vibe.

## Traveler's Vibe
- **Mood:** {{{travelVibe}}}
- **Company:** {{{travelerType}}}
- **Preference:** {{{atmosphere}}}

## Your Instructions
1.  **Analyze the Vibe:** Based on the traveler's preferences, pick ONE perfect primary destination in Uttarakhand.
2.  **Craft the Response:** Your entire response MUST be a single, valid JSON object with the following fields:
    -   \`suggestedLocation\`: The single best destination you chose.
    -   \`reasoning\`: In a friendly tone, explain why this place is a great match. Mention 1-2 alternative places.
    -   \`accommodationType\`: Suggest a suitable type of stay (e.g., "Riverside Camp", "Cozy Homestay", "Luxury Boutique Hotel").
    -   \`silentZoneScore\`: A score from 0 (very busy) to 10 (total peace). This must be a number.
    -   \`bestTimeToVisit\`: The best months to visit (e.g., "September to November").
    -   \`devtaConnectTip\`: If the atmosphere is 'spiritual', add a unique tip about a local temple or ritual. **Otherwise, this MUST be an empty string ("").**

## IMPORTANT
Your entire response MUST be a single, valid JSON object. Do NOT include any text, commentary, or markdown backticks (like \`\`\`json) before or after the JSON object.

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

/**
 * Helper function to find and extract a JSON object from a string.
 * It can handle JSON wrapped in markdown code fences (```json ... ```) or just plain JSON.
 * @param str The string to search for JSON in.
 * @returns The extracted JSON string, or null if not found.
 */
function extractJson(str: string): string | null {
  // Regex to find JSON block, optionally wrapped in markdown ```json ... ```
  const jsonRegex = /```json\s*([\s\S]*?)\s*```|({[\s\S]*})/;
  const match = str.match(jsonRegex);

  if (match) {
    // Return the first non-null capturing group
    return match[1] || match[2];
  }

  return null;
}


// The Genkit flow that orchestrates the AI call
const vibeMatchFlow = ai.defineFlow(
  {
    name: 'vibeMatchFlow',
    inputSchema: VibeMatchInputSchema,
    outputSchema: VibeMatchOutputSchema,
  },
  async (input) => {
    // Get the raw LLM response
    const llmResponse = await suggestionPrompt(input);
    const rawText = llmResponse.text;

    if (!rawText) {
      throw new Error('AI returned an empty response.');
    }
    
    // Find and extract the JSON part of the response
    const jsonString = extractJson(rawText);

    if (!jsonString) {
      console.error('Vibe Match Flow Error: Could not find JSON in the AI response.', { rawText });
      throw new Error('The AI returned a response in an unexpected format.');
    }

    try {
      // Parse the extracted JSON string
      const parsedJson = JSON.parse(jsonString);

      // Validate the parsed object against our Zod schema
      const validationResult = VibeMatchOutputSchema.safeParse(parsedJson);

      if (!validationResult.success) {
        console.error('Vibe Match Flow Error: AI response failed Zod validation.', {
            errors: validationResult.error.flatten(),
            response: parsedJson
        });
        throw new Error('The AI returned data in the wrong structure.');
      }
      
      // If everything is successful, return the validated data
      return validationResult.data;

    } catch (e) {
      console.error('Vibe Match Flow Error: Failed to parse JSON from the AI response.', { jsonString, error: e });
      throw new Error('The AI returned a malformed JSON response.');
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
