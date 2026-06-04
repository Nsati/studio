'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Hotel, Room } from '@/lib/types';
import slugify from 'slugify';
import { revalidatePath } from 'next/cache';
import { HotelUploadSchema } from '../schemas';

/**
 * @fileOverview Hardened Production Bulk Upload for Hotels.
 * Features: Multi-Header Normalization, Robust Room Mapping, and Error Resilience.
 */

export async function bulkUploadHotels(rawHotelsData: any[]): Promise<{ success: boolean; message: string }> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        return { success: false, message: error || "Admin SDK not initialized" };
    }

    try {
        const chunkSize = 100;
        let totalProcessed = 0;

        for (let i = 0; i < rawHotelsData.length; i += chunkSize) {
            const chunk = rawHotelsData.slice(i, i + chunkSize);
            const batch = adminDb.batch();

            for (const rawRow of chunk) {
                // 1. Header Normalization (Handle common synonyms and casing)
                const normalizedRow: any = {};
                Object.keys(rawRow).forEach(key => {
                    const k = key.toLowerCase().trim().replace(/\s+/g, '_');
                    
                    // Map common synonyms to schema keys
                    if (k === 'hotel_name' || k === 'property_name' || k === 'title') normalizedRow['name'] = rawRow[key];
                    else if (k === 'facilities' || k === 'amenity') normalizedRow['amenities'] = rawRow[key];
                    else if (k === 'photos' || k === 'gallery' || k === 'image') normalizedRow['images'] = rawRow[key];
                    else if (k === 'location') normalizedRow['city'] = rawRow[key];
                    else normalizedRow[k] = rawRow[key];
                });

                // 2. Schema Validation
                const validation = HotelUploadSchema.safeParse(normalizedRow);
                if (!validation.success) {
                    console.warn(`[UPLOAD SKIP] Row "${normalizedRow.name || 'Unknown'}" failed validation:`, validation.error.format());
                    continue; 
                }

                const data = validation.data;
                const hotelId = slugify(data.name, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 5);
                const hotelRef = adminDb.collection('hotels').doc(hotelId);

                // 3. Process Rooms (Standardized logic for up to 3 types)
                const roomsToCreate: Room[] = [];
                for (let rIdx = 1; rIdx <= 3; rIdx++) {
                    const type = data[`room_${rIdx}_type` as keyof typeof data];
                    const price = data[`room_${rIdx}_price` as keyof typeof data];
                    const cap = data[`room_${rIdx}_capacity` as keyof typeof data];
                    const tot = data[`room_${rIdx}_total` as keyof typeof data];

                    if (type && price) {
                        const tempRoomId = slugify(`${data.name} ${type} ${Math.random().toString(36).substring(2, 7)}`, { lower: true, strict: true });
                        roomsToCreate.push({ 
                            id: tempRoomId,
                            hotelId,
                            type: type as any, 
                            price: Number(price), 
                            capacity: Number(cap) || 2, 
                            totalRooms: Number(tot) || 10,
                            availableRooms: Number(tot) || 10
                        });
                    }
                }

                const minPrice = roomsToCreate.length > 0 ? Math.min(...roomsToCreate.map(r => r.price)) : 0;

                // 4. Normalize Arrays
                const amenities = data.amenities ? String(data.amenities).split(',').map(a => a.trim().toLowerCase()).filter(Boolean) : [];
                const images = data.images ? String(data.images).split(',').map(img => img.trim()).filter(Boolean) : [];

                const hotelDoc: Hotel = {
                    name: data.name,
                    city: data.city,
                    description: data.description,
                    address: data.address || '',
                    rating: data.rating || 4,
                    discount: data.discount || 0,
                    amenities,
                    images,
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
                
                totalProcessed++;
            }

            if (totalProcessed > 0) {
                await batch.commit();
            }
        }

        revalidatePath('/admin/hotels');
        revalidatePath('/search');
        
        return { 
            success: true, 
            message: `Cloud Grid Synchronized: ${totalProcessed} properties established in the network.` 
        };

    } catch (e: any) {
        console.error("[CRITICAL UPLOAD ERROR]:", e.message);
        return { success: false, message: `Cloud failure: ${e.message}` };
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

        return { success: true, message: 'Property node purged successfully.' };
    } catch (e: any) {
        return { success: false, message: e.message || 'Deletion failed.' };
    }
}
