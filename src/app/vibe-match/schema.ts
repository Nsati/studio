import { z } from 'zod';

export const VibeMatchInputSchema = z.object({
  travelVibe: z.enum(['peace', 'adventure']),
  travelerType: z.enum(['solo', 'couple', 'family']),
  atmosphere: z.enum(['spiritual', 'away_from_crowd']),
});
export type VibeMatchInput = z.infer<typeof VibeMatchInputSchema>;

export const VibeMatchOutputSchema = z.object({
  suggestedLocation: z.string().describe('The primary location suggestion. e.g., "Kanatal" or "Chopta".'),
  reasoning: z.string().describe('A friendly and concise reason why this location is perfect for the user.'),
  accommodationType: z.string().describe('The type of stay recommended. e.g., "Cozy Homestay", "Luxury Resort", "Riverside Camp".'),
  silentZoneScore: z.number().min(0).max(10).describe('A score from 0 (very crowded) to 10 (absolute silence and peace).'),
  bestTimeToVisit: z.string().describe('A short suggestion for the best months to visit. e.g., "September to November".'),
  devtaConnectTip: z.string().optional().describe('A spiritual tip or insight if the user selected a spiritual vibe. e.g., "Visit the ancient Kartik Swami temple nearby for a powerful experience."'),
});
export type VibeMatchOutput = z.infer<typeof VibeMatchOutputSchema>;
