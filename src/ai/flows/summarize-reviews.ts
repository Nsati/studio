
'use server';
/**
 * @fileOverview Tripzy Review Summarizer.
 * Provides a smart "Vibe Check" for hotels based on user feedback.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReviewSummaryInputSchema = z.object({
  hotelName: z.string(),
  reviews: z.array(z.string()).describe('A list of recent review texts.'),
});

const ReviewSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise 2-sentence summary of what guests love and what to watch out for.'),
  vibeScore: z.number().min(0).max(100).describe('An aggregate score from 0-100 based on guest sentiment.'),
});

export async function summarizeReviewsAction(input: z.infer<typeof ReviewSummaryInputSchema>) {
    return reviewSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewSummaryPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: ReviewSummaryInputSchema },
  output: { schema: ReviewSummaryOutputSchema },
  prompt: `You are Tripzy's resident hotel critic.
Summarize the following guest reviews for {{hotelName}}.
Keep it honest, witty, and helpful for future travelers.

Reviews:
{{#each reviews}}
- {{{this}}}
{{/each}}`,
});

const reviewSummaryFlow = ai.defineFlow(
  {
    name: 'reviewSummaryFlow',
    inputSchema: ReviewSummaryInputSchema,
    outputSchema: ReviewSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
