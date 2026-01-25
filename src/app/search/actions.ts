
'use server';

import { getAdminDb } from '@/firebase/admin';
import type { Hotel, Room, Booking } from '@/lib/types';
import { parseISO } from 'date-fns';
import { normalizeTimestamp } from '@/lib/firestore-utils';

interface SearchParams {
    city?: string | null;
    checkIn?: string | null;
    checkOut?: string | null;
    guests?: string | null;
}

/**
 * Chunks an array into smaller arrays of a specified size.
 * @param arr The array to chunk.
 * @param size The size of each chunk.
 * @returns An array of chunks.
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}


export async function searchHotels(params: SearchParams): Promise<Hotel[]> {
    const { city, checkIn, checkOut, guests } = params;

    const db = getAdminDb();
    if (!db) {
        console.error("searchHotels failed: Firebase Admin SDK is not initialized.");
        // Return empty array to avoid crashing the page.
        return [];
    }
    
    // 1. Fetch base hotels
    let hotelsQuery: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('hotels');
    if (city && city !== 'All') {
        hotelsQuery = hotelsQuery.where('city', '==', city);
    }
    const hotelsSnapshot = await hotelsQuery.get();
    if (hotelsSnapshot.empty) return [];
    
    const allHotels = hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Hotel[];

    // If no date range, just return hotels filtered by city
    if (!checkIn || !checkOut) {
        return allHotels;
    }

    const hotelIds = allHotels.map(h => h.id);
    if(hotelIds.length === 0) return [];

    const searchCheckIn = parseISO(checkIn);
    const searchCheckOut = parseISO(checkOut);
    const numGuests = guests ? parseInt(guests, 10) : 1;

    // 2. Fetch all bookings that could possibly conflict, handling Firestore's 30-item limit for 'in' queries.
    const hotelIdChunks = chunkArray(hotelIds, 30);
    let allBookings: Booking[] = [];
    
    const bookingQueries = hotelIdChunks.map(chunk =>
        db.collectionGroup('bookings')
            .where('hotelId', 'in', chunk)
            .where('status', '==', 'CONFIRMED')
            .where('checkOut', '>', searchCheckIn)
            .get()
    );

    const bookingSnapshots = await Promise.all(bookingQueries);
    for (const snapshot of bookingSnapshots) {
        snapshot.docs.forEach(doc => {
            allBookings.push(doc.data() as Booking);
        });
    }

    // Filter bookings that conflict with the search date range
    const conflictingBookings = allBookings.filter(booking => {
        const bookingCheckIn = normalizeTimestamp(booking.checkIn);
        // Overlap condition: (StartA < EndB) and (EndA > StartB)
        // We already did (EndA > StartB) in the query, now we do (StartA < EndB)
        return bookingCheckIn < searchCheckOut;
    });

    // 3. Fetch all rooms for the queried hotels
    const roomsByHotel: Record<string, Room[]> = {};
    await Promise.all(allHotels.map(async (hotel) => {
        const roomsSnapshot = await db.collection('hotels').doc(hotel.id).collection('rooms').get();
        roomsByHotel[hotel.id] = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Room[];
    }));
    
    // 4. Determine available hotels
    const availableHotels = allHotels.filter(hotel => {
        const roomsForHotel = roomsByHotel[hotel.id] || [];
        
        const hasAvailableRoom = roomsForHotel.some(room => {
            // Check guest capacity
            if (room.capacity < numGuests) {
                return false;
            }

            // Count conflicting bookings for this specific room type
            const bookingCountForRoom = conflictingBookings.filter(
                b => b.hotelId === hotel.id && b.roomId === room.id
            ).length;

            // Check if there are enough rooms of this type
            return room.totalRooms > bookingCountForRoom;
        });

        return hasAvailableRoom;
    });

    return availableHotels;
}
