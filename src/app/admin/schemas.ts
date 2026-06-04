
import { z } from 'zod';

/**
 * @fileOverview Centralized Admin Validation Schemas.
 * Hardened for production with lenient types for CSV bulk imports.
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
    // Room fields are now strictly optional for easy bulk import
    room_1_type: z.string().optional(),
    room_1_price: z.coerce.number().positive().optional(),
    room_1_capacity: z.coerce.number().positive().int().optional(),
    room_1_total: z.coerce.number().positive().int().optional(),
    room_2_type: z.string().optional(),
    room_2_price: z.coerce.number().positive().optional(),
    room_2_capacity: z.coerce.number().positive().int().optional(),
    room_2_total: z.coerce.number().positive().int().optional(),
    room_3_type: z.string().optional(),
    room_3_price: z.coerce.number().positive().optional(),
    room_3_capacity: z.coerce.number().positive().int().optional(),
    room_3_total: z.coerce.number().positive().int().optional(),
});

export type HotelUploadData = z.infer<typeof HotelUploadSchema>;

export const TourPackageUploadSchema = z.object({
  title: z.string().min(2, "Title too short"),
  duration: z.string().min(2, "Duration too short"),
  destinations: z.string().min(2, "Destinations required"),
  price: z.coerce.number().min(1, "Price must be positive"),
  gst: z.coerce.number().default(5),
  image: z.string().min(1, "Image required"),
  description: z.string().min(10, "Description too short"),
  persons: z.coerce.number().min(1).default(2),
  rooms: z.coerce.number().min(1).default(1),
  cabType: z.string().default("Sedan"),
  travelDate: z.string().optional().nullable(),
  itinerary: z.string().optional().nullable(), 
  hotels: z.string().optional().nullable(),
  inclusions: z.string().optional().nullable(),
  exclusions: z.string().optional().nullable(),
  policy_tcs: z.string().optional().nullable(),
  policy_cancellation: z.string().optional().nullable(),
  policy_payment: z.string().optional().nullable(),
  policy_terms: z.string().optional().nullable(),
});

export type TourPackageUploadData = z.infer<typeof TourPackageUploadSchema>;
