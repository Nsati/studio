import {genkit, type GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize an empty array for plugins.
const plugins: GenkitPlugin[] = [];

// Only add the googleAI plugin if the API key is available in the environment.
// This prevents the server from crashing if the key is not set.
if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI());
} else {
  // Log a clear warning in the server console during development.
  if (process.env.NODE_ENV === 'development') {
    console.warn(`
      ****************************************************************
      * WARNING: GEMINI_API_KEY is not set in your .env file.        *
      * ------------------------------------------------------------ *
      * AI-powered features like the Trip Assistant and AI Review    *
      * Summaries will be disabled. To enable them, add your Gemini  *
      * API key to the .env file.                                    *
      ****************************************************************
    `);
  }
}

export const ai = genkit({
  plugins,
  // Only set a default model if the googleAI plugin was added.
  // This prevents Genkit from throwing an error about a missing model provider.
  model: plugins.length > 0 ? 'googleai/gemini-2.5-flash' : undefined,
});
