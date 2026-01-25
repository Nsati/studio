
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
    
    let hotelsQuery: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = (db ?? (await import('firebase/firestore')).getFirestore()).collection('hotels');
    
    if (!db) {
        console.warn("searchHotels is running in client-emulation mode because Firebase Admin SDK is not configured. Availability filtering is disabled.");
        if (city && city !== 'All') {
            hotelsQuery = hotelsQuery.where('city', '==', city);
        }
        const hotelsSnapshot = await (await import('firebase/firestore')).getDocs(hotelsQuery);
        if (hotelsSnapshot.empty) return [];
        return hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Hotel[];
    }
    
    if (city && city !== 'All') {
        hotelsQuery = hotelsQuery.where('city', '==', city);
    }
    const hotelsSnapshot = await hotelsQuery.get();
    if (hotelsSnapshot.empty) return [];
    
    const allHotels = hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Hotel[];

    if (!checkIn || !checkOut || !db) {
        return allHotels;
    }

    const hotelIds = allHotels.map(h => h.id);
    if(hotelIds.length === 0) return [];

    const searchCheckIn = parseISO(checkIn);
    const searchCheckOut = parseISO(checkOut);
    const numGuests = guests ? parseInt(guests, 10) : 1;

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

    const conflictingBookings = allBookings.filter(booking => {
        const bookingCheckIn = normalizeTimestamp(booking.checkIn);
        return bookingCheckIn < searchCheckOut;
    });

    const roomsByHotel: Record<string, Room[]> = {};
    await Promise.all(allHotels.map(async (hotel) => {
        const roomsSnapshot = await db.collection('hotels').doc(hotel.id).collection('rooms').get();
        roomsByHotel[hotel.id] = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Room[];
    }));
    
    const availableHotels = allHotels.filter(hotel => {
        const roomsForHotel = roomsByHotel[hotel.id] || [];
        
        const hasAvailableRoom = roomsForHotel.some(room => {
            if (room.capacity < numGuests) {
                return false;
            }

            const bookingCountForRoom = conflictingBookings.filter(
                b => b.hotelId === hotel.id && b.roomId === room.id
            ).length;

            return room.totalRooms > bookingCountForRoom;
        });

        return hasAvailableRoom;
    });

    return availableHotels;
}
