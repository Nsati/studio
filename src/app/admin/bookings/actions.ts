
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking } from '@/lib/types';
import type { WithId } from '@/firebase';

// A serializable version of the booking to safely pass from server to client.
export type SerializableBooking = Omit<Booking, 'checkIn' | 'checkOut' | 'createdAt'> & {
    checkIn: string;
    checkOut: string;
    createdAt: string;
};


/**
 * Fetches all bookings using the Firebase Admin SDK, which bypasses all security rules.
 * This ensures admins can reliably retrieve all data.
 * Gracefully returns an empty array if the Admin SDK is not initialized.
 */
export async function getAdminAllBookings(): Promise<WithId<SerializableBooking>[]> {
    const admin = getFirebaseAdmin();
    if (!admin) {
        console.warn('Admin get all bookings skipped: Firebase Admin SDK not initialized.');
        return [];
    }
    const adminDb = admin.firestore;
    
    const bookingsSnapshot = await adminDb.collectionGroup('bookings').get();

    const bookings: WithId<SerializableBooking>[] = [];
    bookingsSnapshot.forEach(doc => {
        const data = doc.data() as Booking;
        bookings.push({
            ...(data as any), // This is a bit of a hack to satisfy TS with the new structure
            id: doc.id, // Ensure ID is included
            // Convert Timestamps to ISO strings for serialization
            checkIn: (data.checkIn as any).toDate().toISOString(),
            checkOut: (data.checkOut as any).toDate().toISOString(),
            createdAt: (data.createdAt as any)?.toDate()?.toISOString() || new Date().toISOString(),
        });
    });

    return bookings;
}
