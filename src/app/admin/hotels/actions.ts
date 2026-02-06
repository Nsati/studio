
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Hotel, Room } from '@/lib/types';
import slugify from 'slugify';
import { z } from 'zod';

// Zod schema for a single row of the CSV
export const HotelUploadSchema = z.object({
    name: z.string().min(3),
    city: z.string().min(1),
    description: z.string().min(10),
    address: z.string().optional(),
    rating: z.coerce.number().min(1).max(5),
    discount: z.coerce.number().min(0).max(100).optional(),
    amenities: z.string(), // comma separated
    images: z.string(), // comma separated
    // Optional Room 1
    room_1_type: z.enum(['Standard', 'Deluxe', 'Suite']).optional(),
    room_1_price: z.coerce.number().positive().optional(),
    room_1_capacity: z.coerce.number().positive().int().optional(),
    room_1_total: z.coerce.number().positive().int().optional(),
    // Optional Room 2
    room_2_type: z.enum(['Standard', 'Deluxe', 'Suite']).optional(),
    room_2_price: z.coerce.number().positive().optional(),
    room_2_capacity: z.coerce.number().positive().int().optional(),
    room_2_total: z.coerce.number().positive().int().optional(),
    // Optional Room 3
    room_3_type: z.enum(['Standard', 'Deluxe', 'Suite']).optional(),
    room_3_price: z.coerce.number().positive().optional(),
    room_3_capacity: z.coerce.number().positive().int().optional(),
    room_3_total: z.coerce.number().positive().int().optional(),
});

export type HotelUploadData = z.infer<typeof HotelUploadSchema>;

export async function bulkUploadHotels(hotelsData: HotelUploadData[]): Promise<{ success: boolean; message: string }> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        console.error("Bulk upload error:", error);
        return { success: false, message: error || "Admin SDK not initialized" };
    }

    const batch = adminDb.batch();

    try {
        for (const hotelData of hotelsData) {
            const validation = HotelUploadSchema.safeParse(hotelData);
            if (!validation.success) {
                throw new Error(`Invalid data for hotel "${hotelData.name}": ${validation.error.message}`);
            }

            const hotel = validation.data; 
            const hotelId = slugify(hotel.name, { lower: true, strict: true });
            const hotelRef = adminDb.collection('hotels').doc(hotelId);

            // Intermediate room creation logic fixed for Room interface compatibility
            const roomsToCreate: Array<Omit<Room, 'id' | 'hotelId' | 'availableRooms'>> = [];
            
            for (let i = 1; i <= 3; i++) {
                const type = hotel[`room_${i}_type` as 'room_1_type' | 'room_2_type' | 'room_3_type'];
                const price = hotel[`room_${i}_price` as 'room_1_price' | 'room_2_price' | 'room_3_price'];
                const capacity = hotel[`room_${i}_capacity` as 'room_1_capacity' | 'room_2_capacity' | 'room_3_capacity'];
                const totalRooms = hotel[`room_${i}_total` as 'room_1_total' | 'room_2_total' | 'room_3_total'];

                if (type && price && capacity && totalRooms) {
                    roomsToCreate.push({ 
                        type: type as 'Standard' | 'Deluxe' | 'Suite', 
                        price, 
                        capacity, 
                        totalRooms 
                    });
                }
            }

            if (roomsToCreate.length === 0) {
                 throw new Error(`Hotel "${hotel.name}" must have at least one valid room definition.`);
            }

            const minPrice = Math.min(...roomsToCreate.map(r => r.price));

            const hotelDoc: Hotel = {
                name: hotel.name,
                city: hotel.city,
                description: hotel.description,
                address: hotel.address || '',
                rating: hotel.rating,
                discount: hotel.discount || 0,
                amenities: hotel.amenities.split(',').map(a => a.trim()).filter(Boolean),
                images: hotel.images.split(',').map(i => i.trim()).filter(Boolean),
                minPrice,
                mountainSafetyScore: 85,
                landslideRisk: 'Low',
                roadCondition: 'Good for all vehicles',
                networkJio: true,
                networkAirtel: true,
                networkBsnl: false,
                isSnowFriendly: true,
                isElderlySafe: true,
                hasPowerBackup: true,
                nearestAtmKm: 2,
                cabFareToCenter: 300,
                balconyWorthIt: true,
                ecoPractices: { waterSaving: true, plasticFree: false, localSourcing: true },
                safetyInfo: { networkCoverage: 'good' },
                spiritualAmenities: []
            };

            batch.set(hotelRef, hotelDoc);

            for (const r of roomsToCreate) {
                const roomId = slugify(`${hotel.name} ${r.type} ${Math.random().toString(36).substring(2, 7)}`, { lower: true, strict: true });
                const roomRef = hotelRef.collection('rooms').doc(roomId);
                
                const roomDoc: Room = {
                    ...r,
                    id: roomId,
                    hotelId,
                    availableRooms: r.totalRooms,
                };
                batch.set(roomRef, roomDoc);
            }
        }

        await batch.commit();
        return { success: true, message: `Successfully uploaded ${hotelsData.length} hotels to Tripzy.` };

    } catch (e: any) {
        console.error("Failed to bulk upload hotels:", e);
        return { success: false, message: e.message || 'An unexpected error occurred during upload.' };
    }
}
