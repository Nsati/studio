
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Hotel, Room } from '@/lib/types';
import slugify from 'slugify';
import { revalidatePath } from 'next/cache';
import { HotelUploadSchema, type HotelUploadData } from '../schemas';

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
            const hotelId = slugify(hotel.name, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 5);
            const hotelRef = adminDb.collection('hotels').doc(hotelId);

            const roomsToCreate: Room[] = [];
            
            // Process rooms (1 to 3) if they exist in CSV
            for (let i = 1; i <= 3; i++) {
                const typeKey = `room_${i}_type` as keyof HotelUploadData;
                const priceKey = `room_${i}_price` as keyof HotelUploadData;
                const capacityKey = `room_${i}_capacity` as keyof HotelUploadData;
                const totalKey = `room_${i}_total` as keyof HotelUploadData;

                const type = hotel[typeKey];
                const price = hotel[priceKey];
                const capacity = hotel[capacityKey];
                const totalRooms = hotel[totalKey];

                if (type && price) {
                    const tempRoomId = slugify(`${hotel.name} ${type} ${Math.random().toString(36).substring(2, 7)}`, { lower: true, strict: true });
                    roomsToCreate.push({ 
                        id: tempRoomId,
                        hotelId,
                        type: type as any, 
                        price: Number(price), 
                        capacity: Number(capacity) || 2, 
                        totalRooms: Number(totalRooms) || 10,
                        availableRooms: Number(totalRooms) || 10
                    });
                }
            }

            const minPrice = roomsToCreate.length > 0 ? Math.min(...roomsToCreate.map(r => r.price)) : (hotel.room_1_price || 0);

            const hotelDoc: Hotel = {
                name: hotel.name,
                city: hotel.city,
                description: hotel.description,
                address: hotel.address || '',
                rating: hotel.rating || 4,
                discount: hotel.discount || 0,
                amenities: hotel.amenities ? hotel.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
                images: hotel.images ? hotel.images.split(',').map(i => i.trim()).filter(Boolean) : [],
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
                const roomRef = hotelRef.collection('rooms').doc(r.id);
                batch.set(roomRef, r);
            }
        }

        await batch.commit();
        revalidatePath('/admin/hotels');
        return { success: true, message: `Successfully synchronized ${hotelsData.length} properties with room inventory.` };

    } catch (e: any) {
        console.error("Failed to bulk upload hotels:", e);
        return { success: false, message: e.message || 'An unexpected error occurred during upload.' };
    }
}

export async function deleteHotelAction(hotelId: string) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: "Admin SDK not initialized" };

    try {
        const hotelRef = adminDb.collection('hotels').doc(hotelId);
        
        const roomsSnap = await hotelRef.collection('rooms').get();
        const reviewsSnap = await hotelRef.collection('reviews').get();

        const batch = adminDb.batch();
        
        roomsSnap.forEach(doc => batch.delete(doc.ref));
        reviewsSnap.forEach(doc => batch.delete(doc.ref));
        batch.delete(hotelRef);

        await batch.commit();
        
        revalidatePath('/admin/hotels');
        revalidatePath('/search');
        revalidatePath('/');

        return { success: true, message: 'Property and its inventory purged successfully.' };
    } catch (e: any) {
        console.error("Delete Hotel Error:", e);
        return { success: false, message: e.message || 'Cloud deletion failed.' };
    }
}
