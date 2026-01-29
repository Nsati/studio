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
    VibeMatchOutputSchema
} from '@/app/vibe-match/schema';
import type { VibeMatchInput, VibeMatchOutput } from '@/app/vibe-match/schema';

export type { VibeMatchInput, VibeMatchOutput };

// Type for the server action's return value
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
    prompt: `You are "Devbhoomi Dost," a master travel guide for the Indian Himalayas, specifically the state of Uttarakhand. Your persona is that of a wise, friendly local who knows all the hidden gems and gives honest, practical advice.

A traveler has given you their preferences. Your mission is to provide them with a single, perfect travel suggestion.

**User Preferences:**
*   **Current Vibe:** {{{travelVibe}}}
*   **Company:** {{{travelerType}}}
*   **Desired Atmosphere:** {{{atmosphere}}}

**Your Instructions:**

1.  **Analyze the Vibe:**
    *   If the vibe is 'peace', suggest a serene, lesser-known location like Mukteshwar, Kanatal, or Chopta. Avoid crowded places.
    *   If the vibe is 'adventure', you can suggest places with activities like Rishikesh (rafting), Auli (skiing), or other trekking bases.

2.  **Generate the Recommendation:** You will generate a single JSON object that contains the following fields:
    *   **suggestedLocation:** The name of the ONE location you recommend.
    *   **reasoning:** A short, compelling paragraph explaining *why* this place is the perfect match for the user's vibe.
    *   **accommodationType:** A suitable type of stay (e.g., "Cozy Homestay," "Riverside Camp," "Luxury Boutique Hotel").
    *   **silentZoneScore:** An integer score from 0 (most crowded) to 10 (complete silence). Be honest.
    *   **bestTimeToVisit:** The ideal months for a visit (e.g., "March to June" or "September to November").
    *   **devtaConnectTip:** (ONLY if \`atmosphere\` is 'spiritual') A unique, insightful tip about a local temple, spiritual spot, or ritual. If the atmosphere is not spiritual, omit this field.

3.  **Crucial Output Format:**
    *   The final output MUST be a single, valid JSON object.
    *   There must be NO text, markdown, or any characters before or after the JSON object.
    *   The \`silentZoneScore\` must be an integer, not a string.

**Example for a spiritual query:**
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
    const { output } = await suggestionPrompt(input);
    if (!output) {
        throw new Error("The AI could not generate a suggestion. Please try again.");
    }
    return output;
  }
);

/**
 * The Server Action that is called from the client.
 * @param input The user's travel preferences.
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
