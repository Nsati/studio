'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating hotel descriptions based on input parameters.
 *
 * The flow takes in hotel name, city, amenities, and keywords, and outputs a generated hotel description.
 *
 * @interface GenerateHotelDescriptionInput - Defines the input schema for the generateHotelDescription flow.
 * @interface GenerateHotelDescriptionOutput - Defines the output schema for the generateHotelDescription flow.
 * @function generateHotelDescription - The main function to trigger the hotel description generation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHotelDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the hotel.'),
  city: z.string().describe('The city where the hotel is located.'),
  amenities: z.string().describe('A comma-separated list of amenities offered by the hotel.'),
  keywords: z.string().describe('A comma-separated list of keywords to include in the description.'),
});

export type GenerateHotelDescriptionInput = z.infer<
  typeof GenerateHotelDescriptionInputSchema
>;

const GenerateHotelDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated description of the hotel.'),
});

export type GenerateHotelDescriptionOutput = z.infer<
  typeof GenerateHotelDescriptionOutputSchema
>;

export async function generateHotelDescription(
  input: GenerateHotelDescriptionInput
): Promise<GenerateHotelDescriptionOutput> {
  return generateHotelDescriptionFlow(input);
}

const generateHotelDescriptionPrompt = ai.definePrompt({
  name: 'generateHotelDescriptionPrompt',
  input: {schema: GenerateHotelDescriptionInputSchema},
  output: {schema: GenerateHotelDescriptionOutputSchema},
  prompt: `You are a professional copywriter specializing in hotel descriptions.
  Generate an engaging and informative description for the following hotel:

  Hotel Name: {{name}}
  City: {{city}}
  Amenities: {{amenities}}
  Keywords: {{keywords}}

  Write a compelling description that highlights the hotel's unique features and attracts potential guests.
  The description should be approximately 150-200 words.
  `,
});

const generateHotelDescriptionFlow = ai.defineFlow(
  {
    name: 'generateHotelDescriptionFlow',
    inputSchema: GenerateHotelDescriptionInputSchema,
    outputSchema: GenerateHotelDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateHotelDescriptionPrompt(input);
    return output!;
  }
);
