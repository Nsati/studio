'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-booking-confirmation-email.ts';
