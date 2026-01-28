import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// This is the central AI configuration for the application.
// It initializes Genkit with the Google AI plugin, allowing us to use models like Gemini.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
