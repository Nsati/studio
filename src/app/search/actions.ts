'use server';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, collectionGroup } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { Hotel, Room, Booking } from '@/lib/types';
import { parseISO } from 'date-fns';

// --- Server-side Firebase initialization ---
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const firestore = getFirestore(app);
// --- End of initialization ---


interface SearchParams {
    city?: string | null;
    checkIn?: string | null;
    checkOut?: string | null;
    guests?: string | null;
}

export async function searchHotels(params: SearchParams): Promise<Hotel[]> {
    const { city, checkIn, checkOut, guests } = params;

    // 1. Fetch base hotels
    let hotelsQuery = query(collection(firestore, 'hotels'));
    if (city && city !== 'All') {
        hotelsQuery = query(hotelsQuery, where('city', '==', city));
    }
    const hotelsSnapshot = await getDocs(hotelsQuery);
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
    const bookingsQuery = query(
        collectionGroup(firestore, 'bookings'),
        where('hotelId', 'in', hotelIds),
        where('status', '==', 'CONFIRMED')
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const allBookings = bookingsSnapshot.docs.map(doc => doc.data()) as Booking[];
    
    // Filter bookings that conflict with the search date range
    const conflictingBookings = allBookings.filter(booking => {
        const bookingCheckIn = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
        const bookingCheckOut = (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate() : new Date(booking.checkOut);
        // Overlap condition: (StartA < EndB) and (EndA > StartB)
        return bookingCheckIn < searchCheckOut && bookingCheckOut > searchCheckIn;
    });

    // 3. Fetch all rooms for the queried hotels
    const roomsByHotel: Record<string, Room[]> = {};
    await Promise.all(allHotels.map(async (hotel) => {
        const roomsSnapshot = await getDocs(collection(firestore, 'hotels', hotel.id, 'rooms'));
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
