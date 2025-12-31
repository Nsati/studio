'use server';

import {
  generateHotelDescription,
  type GenerateHotelDescriptionInput,
  type GenerateHotelDescriptionOutput
} from '@/ai/flows/generate-hotel-description';

export async function generateDescriptionAction(
  input: GenerateHotelDescriptionInput
): Promise<GenerateHotelDescriptionOutput> {
  try {
    const output = await generateHotelDescription(input);
    return output;
  } catch (error) {
    console.error('Error generating description:', error);
    // In a real app, you might want to return a structured error response
    return { description: '' };
  }
}
