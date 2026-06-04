import { z } from 'zod';

/**
 * @fileOverview Centralized Admin Validation Schemas.
 * Hardened for production with lenient types for CSV bulk imports.
 */

// Helper to handle optional numbers that might come as empty strings from CSV
const optionalCoerceNumber = z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
}, z.number().optional());

export const UpdateUserSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  mobile: z.string().length(10, { message: 'Mobile number must be 10 digits.' }),
  role: z.enum(['user', 'admin']),
  status: z.enum(['pending', 'active', 'suspended']),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const HotelUploadSchema = z.object({
    name: z.string().min(2),
    city: z.string().min(1),
    description: z.string().min(5),
    address: z.string().optional().default(''),
    rating: z.preprocess((val) => Number(val) || 4, z.number().min(1).max(5).default(4)),
    discount: z.preprocess((val) => Number(val) || 0, z.number().min(0).max(100).default(0)),
    amenities: z.string().optional().default(''), 
    images: z.string().optional().default(''), 
    // Room fields are highly robust now
    room_1_type: z.string().optional(),
    room_1_price: optionalCoerceNumber,
    room_1_capacity: optionalCoerceNumber,
    room_1_total: optionalCoerceNumber,
    room_2_type: z.string().optional(),
    room_2_price: optionalCoerceNumber,
    room_2_capacity: optionalCoerceNumber,
    room_2_total: optionalCoerceNumber,
    room_3_type: z.string().optional(),
    room_3_price: optionalCoerceNumber,
    room_3_capacity: optionalCoerceNumber,
    room_3_total: optionalCoerceNumber,
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
