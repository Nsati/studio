'use server';

import { getVibeSuggestion } from "@/ai/flows/vibe-match-flow";
import type { VibeMatchInput, VibeMatchOutput } from "@/app/vibe-match/schema";

type VibeMatchResult = {
    success: boolean;
    data: VibeMatchOutput | null;
    error?: string;
}

/**
 * Server action to get an AI-powered travel suggestion.
 * This function is called from the client and executes on the server.
 *
 * @param input The user's preferences for their trip.
 * @returns A result object containing the AI's suggestion or an error.
 */
export async function getVibeMatchSuggestionAction(input: VibeMatchInput): Promise<VibeMatchResult> {
    try {
        const suggestion = await getVibeSuggestion(input);
        return { success: true, data: suggestion };
    } catch (error: any) {
        console.error("Vibe Match Action Error:", error);
        return { success: false, data: null, error: "Sorry, I couldn't come up with a suggestion right now. Please try again." };
    }
}
