
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking } from '@/lib/types';
import type { WithId } from '@/firebase';

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
export async function getAdminAllBookings(): Promise<WithId<SerializableBooking>[]> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        console.error("Admin bookings error:", error);
        return [];
    }
    
    const bookingsSnapshot = await adminDb.collectionGroup('bookings').get();

    const bookings: WithId<SerializableBooking>[] = [];
    bookingsSnapshot.forEach(doc => {
        const data = doc.data() as Booking;
        bookings.push({
            ...(data as any),
            id: doc.id,
            checkIn: (data.checkIn as any).toDate().toISOString(),
            checkOut: (data.checkOut as any).toDate().toISOString(),
            createdAt: (data.createdAt as any)?.toDate()?.toISOString() || new Date().toISOString(),
        });
    });

    return bookings;
}
