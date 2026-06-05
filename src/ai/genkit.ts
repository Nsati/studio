import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Central AI configuration for Northern Harrier.
 * Initialized with Genkit v1.x and Google AI plugin.
 */

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: googleAI.model('gemini-2.5-flash'), // Set production default model
});

export { z };
