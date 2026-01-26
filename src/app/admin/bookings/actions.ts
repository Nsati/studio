
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking } from '@/lib/types';

// A serializable version of the booking to safely pass from server to client.
export type SerializableBooking = Omit<Booking, 'checkIn' | 'checkOut' | 'createdAt'> & {
    id: string;
    checkIn: string;
    checkOut: string;
    createdAt: string;
};


/**
 * Fetches all bookings using the Firebase Admin SDK, which bypasses all security rules.
 * This ensures admins can reliably retrieve all data.
 */
export async function getAdminAllBookings(): Promise<SerializableBooking[]> {
    const admin = getFirebaseAdmin();
    const adminDb = admin.firestore;
    
    const bookingsSnapshot = await adminDb.collectionGroup('bookings').get();

    const bookings: SerializableBooking[] = [];
    bookingsSnapshot.forEach(doc => {
        const data = doc.data() as Booking;
        bookings.push({
            ...data,
            id: doc.id, // Ensure ID is included
            // Convert Timestamps to ISO strings for serialization
            checkIn: (data.checkIn as any).toDate().toISOString(),
            checkOut: (data.checkOut as any).toDate().toISOString(),
            createdAt: (data.createdAt as any)?.toDate()?.toISOString() || new Date().toISOString(),
        });
    });

    return bookings;
}
