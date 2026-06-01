
import { z } from 'zod';

/**
 * @fileOverview Centralized Admin Validation Schemas.
 * These are moved out of "use server" files to comply with Next.js rules.
 */

export const UpdateUserSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  mobile: z.string().length(10, { message: 'Mobile number must be 10 digits.' }),
  role: z.enum(['user', 'admin']),
  status: z.enum(['pending', 'active', 'suspended']),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const HotelUploadSchema = z.object({
    name: z.string().min(3),
    city: z.string().min(1),
    description: z.string().min(10),
    address: z.string().optional(),
    rating: z.coerce.number().min(1).max(5),
    discount: z.coerce.number().min(0).max(100).optional(),
    amenities: z.string(), // comma separated
    images: z.string(), // comma separated
    room_1_type: z.enum(['Standard', 'Deluxe', 'Suite']).optional(),
    room_1_price: z.coerce.number().positive().optional(),
    room_1_capacity: z.coerce.number().positive().int().optional(),
    room_1_total: z.coerce.number().positive().int().optional(),
    room_2_type: z.enum(['Standard', 'Deluxe', 'Suite']).optional(),
    room_2_price: z.coerce.number().positive().optional(),
    room_2_capacity: z.coerce.number().positive().int().optional(),
    room_2_total: z.coerce.number().positive().int().optional(),
    room_3_type: z.enum(['Standard', 'Deluxe', 'Suite']).optional(),
    room_3_price: z.coerce.number().positive().optional(),
    room_3_capacity: z.coerce.number().positive().int().optional(),
    room_3_total: z.coerce.number().positive().int().optional(),
});

export type HotelUploadData = z.infer<typeof HotelUploadSchema>;

export const TourPackageUploadSchema = z.object({
  title: z.string().min(5),
  duration: z.string().min(3),
  destinations: z.string(),
  price: z.coerce.number().min(1),
  gst: z.coerce.number().default(5),
  image: z.string().min(1),
  description: z.string().min(20),
  persons: z.coerce.number().min(1),
  rooms: z.coerce.number().min(1),
  cabType: z.string(),
  travelDate: z.string().optional(),
  itinerary: z.string().optional(), 
  hotels: z.string().optional(),
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
  policy_tcs: z.string().optional(),
  policy_cancellation: z.string().optional(),
  policy_payment: z.string().optional(),
  policy_terms: z.string().optional(),
});

export type TourPackageUploadData = z.infer<typeof TourPackageUploadSchema>;
