
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
 */
export async function getAdminAllBookings(): Promise<WithId<SerializableBooking>[]> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        console.error("Admin bookings error:", error);
        throw new Error(error || "Admin SDK not initialized");
    }
    
    const bookingsSnapshot = await adminDb.collectionGroup('bookings').orderBy('createdAt', 'desc').limit(100).get();

    const bookings: WithId<SerializableBooking>[] = bookingsSnapshot.docs.map(doc => {
        const data = doc.data() as Booking;
        return {
            ...(data as any),
            id: doc.id,
            checkIn: (data.checkIn as any).toDate().toISOString(),
            checkOut: (data.checkOut as any).toDate().toISOString(),
            createdAt: (data.createdAt as any)?.toDate()?.toISOString() || new Date().toISOString(),
        };
    });

    return bookings;
}
