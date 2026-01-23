'use server';

import { adminDb } from '@/firebase/admin';
import type { Hotel, Room, Booking } from '@/lib/types';
import { parseISO } from 'date-fns';

interface SearchParams {
    city?: string | null;
    checkIn?: string | null;
    checkOut?: string | null;
    guests?: string | null;
}

export async function searchHotels(params: SearchParams): Promise<Hotel[]> {
    const { city, checkIn, checkOut, guests } = params;

    if (!adminDb) {
        console.error("searchHotels failed: Firebase Admin SDK is not initialized.");
        // Return empty array to avoid crashing the page.
        return [];
    }

    // 1. Fetch base hotels
    let hotelsQuery: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('hotels');
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

    // 2. Fetch all bookings that could possibly conflict
    // NOTE: The 'in' operator is limited to 30 items in Node SDK. A production system would need to chunk this.
    const bookingsQuery = adminDb.collectionGroup('bookings')
        .where('hotelId', 'in', hotelIds)
        .where('status', '==', 'CONFIRMED')
        .where('checkOut', '>', searchCheckIn);
        
    const bookingsSnapshot = await bookingsQuery.get();
    const allBookings = bookingsSnapshot.docs.map(doc => doc.data()) as Booking[];
    
    // Filter bookings that conflict with the search date range
    const conflictingBookings = allBookings.filter(booking => {
        // Firestore timestamps need to be converted to JS Dates
        const bookingCheckIn = (booking.checkIn as any).toDate();
        // Overlap condition: (StartA < EndB) and (EndA > StartB)
        // We already did (EndA > StartB) in the query, now we do (StartA < EndB)
        return bookingCheckIn < searchCheckOut;
    });

    // 3. Fetch all rooms for the queried hotels
    const roomsByHotel: Record<string, Room[]> = {};
    await Promise.all(allHotels.map(async (hotel) => {
        const roomsSnapshot = await adminDb.collection('hotels').doc(hotel.id).collection('rooms').get();
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
