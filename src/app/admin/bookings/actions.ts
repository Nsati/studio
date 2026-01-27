
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
 * Fetches the 100 most recent bookings using the Firebase Admin SDK.
 * This ensures admins can reliably retrieve data without overloading the client.
 * The query is modified to sort in-memory to prevent missing index errors.
 */
export async function getAdminAllBookings(): Promise<WithId<SerializableBooking>[]> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        console.error("Admin bookings error:", error);
        throw new Error(error || "Admin SDK not initialized");
    }
    
    // Fetch without ordering to avoid index errors, then sort and limit in-memory.
    const bookingsSnapshot = await adminDb.collectionGroup('bookings').get();

    const sortedDocs = bookingsSnapshot.docs.sort((a, b) => {
        const dateA = (a.data().createdAt as any)?.toDate() || new Date(0);
        const dateB = (b.data().createdAt as any)?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
    }).slice(0, 100); // Apply limit after sorting

    const bookings: WithId<SerializableBooking>[] = sortedDocs.map(doc => {
        const data = doc.data() as Booking;
        const createdAtDate = (data.createdAt as any)?.toDate() || new Date();
        return {
            ...(data as any),
            id: doc.id,
            checkIn: ((data.checkIn as any)?.toDate() || new Date()).toISOString(),
            checkOut: ((data.checkOut as any)?.toDate() || new Date()).toISOString(),
            createdAt: createdAtDate.toISOString(),
        };
    });

    return bookings;
}
