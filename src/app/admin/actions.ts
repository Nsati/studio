
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking, UserProfile, Hotel } from '@/lib/types';
import type { WithId } from '@/firebase';

export type SerializableBooking = Omit<Booking, 'checkIn' | 'checkOut' | 'createdAt'> & {
    id: string;
    checkIn: string;
    checkOut: string;
    createdAt: string;
};
export type SerializableUserProfile = WithId<UserProfile>;
export type SerializableHotel = WithId<Hotel>;


/**
 * Fetches all necessary data for the admin dashboard using the Firebase Admin SDK,
 * which bypasses all Firestore security rules.
 */
export async function getAdminDashboardStats(): Promise<{
    bookings: SerializableBooking[],
    users: SerializableUserProfile[],
    hotels: SerializableHotel[]
}> {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) {
        console.error("Admin dashboard error:", error);
        // Throw an error that can be caught by the client
        throw new Error(error || "Admin SDK not initialized");
    }
    
    const [bookingsSnapshot, usersSnapshot, hotelsSnapshot] = await Promise.all([
        adminDb.collectionGroup('bookings').get(),
        adminDb.collection('users').get(),
        adminDb.collection('hotels').get()
    ]);

    const bookings: SerializableBooking[] = bookingsSnapshot.docs.map(doc => {
        const data = doc.data() as Booking;
        return {
            ...data,
            id: doc.id,
            checkIn: (data.checkIn as any).toDate().toISOString(),
            checkOut: (data.checkOut as any).toDate().toISOString(),
            createdAt: (data.createdAt as any)?.toDate()?.toISOString() || new Date(0).toISOString(),
        };
    });

    const users: SerializableUserProfile[] = usersSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as UserProfile) }));
    const hotels: SerializableHotel[] = hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Hotel) }));
    
    return { bookings, users, hotels };
}
