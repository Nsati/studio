'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing customer reviews.
 *
 * The flow takes a list of review texts and generates a concise summary
 * categorized into pros and cons.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SummarizeReviewsInputSchema = z.object({
  reviews: z.array(z.string()).describe('A list of customer review texts.'),
  hotelName: z.string().describe('The name of the hotel being reviewed.'),
});

export type SummarizeReviewsInput = z.infer<typeof SummarizeReviewsInputSchema>;

const SummarizeReviewsOutputSchema = z.object({
  pros: z
    .array(z.string())
    .describe('A list of 3-4 positive points (pros) mentioned in the reviews. Each point should be concise and start with an emoji.'),
  cons: z
    .array(z.string())
    .describe('A list of 1-2 negative points (cons) or areas for improvement. Each point should be concise and start with an emoji.'),
});

export type SummarizeReviewsOutput = z.infer<typeof SummarizeReviewsOutputSchema>;

export async function summarizeReviews(
  input: SummarizeReviewsInput
): Promise<SummarizeReviewsOutput> {
  // Add a guard to prevent calling the flow if AI is not configured.
  if (!ai.model) {
    throw new Error('AI model is not configured. Please set GEMINI_API_KEY in your .env file.');
  }
  return summarizeReviewsFlow(input);
}

const summarizeReviewsPrompt = ai.definePrompt({
  name: 'summarizeReviewsPrompt',
  input: { schema: SummarizeReviewsInputSchema },
  output: { schema: SummarizeReviewsOutputSchema },
  prompt: `
You are an expert review analyst for a hotel booking website.
Your task is to read a collection of customer reviews for a hotel named "{{hotelName}}" and generate a short, easy-to-read summary of the pros and cons.

**Instructions:**
1.  Read all the reviews provided below.
2.  Identify the most common and significant positive themes. Create a list of 3-4 "Pros".
3.  Identify the most common or significant negative themes or areas for improvement. Create a list of 1-2 "Cons".
4.  Each point in the pros and cons lists must be very concise (max 10-12 words).
5.  Start each "Pro" with a relevant positive emoji (e.g., 👍, ✨, 😍, ⭐).
6.  Start each "Con" with a relevant constructive or negative emoji (e.g., ⚠️, 🤔, 👎).
7.  Focus on recurring themes. A single complaint or praise might not be worth including unless it's very impactful.
8.  Do not invent any information not present in the reviews. If there are no clear cons, you can return an empty array for cons.

**Customer Reviews:**
{{#each reviews}}
- "{{this}}"
{{/each}}
`,
});

const summarizeReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeReviewsFlow',
    inputSchema: SummarizeReviewsInputSchema,
    outputSchema: SummarizeReviewsOutputSchema,
  },
  async (input) => {
    // If there are no reviews, return an empty summary.
    if (!input.reviews || input.reviews.length === 0) {
      return { pros: [], cons: [] };
    }
    const { output } = await summarizeReviewsPrompt(input);
    return output!;
  }
);
