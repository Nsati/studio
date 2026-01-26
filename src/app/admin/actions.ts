
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking, UserProfile, Hotel } from '@/lib/types';

// Omit functions and other non-serializable fields from types to be sent to the client.
export type SerializableBooking = Omit<Booking, 'checkIn' | 'checkOut' | 'createdAt'> & {
    id: string;
    checkIn: string;
    checkOut: string;
    createdAt: string;
};
export type SerializableUserProfile = Omit<UserProfile, ''>; // UserProfile is already serializable
export type SerializableHotel = Omit<Hotel, ''>; // Hotel is already serializable


/**
 * Fetches all necessary data for the admin dashboard using the Firebase Admin SDK,
 * which bypasses all Firestore security rules.
 */
export async function getAdminDashboardStats(): Promise<{
    bookings: SerializableBooking[],
    users: SerializableUserProfile[],
    hotels: SerializableHotel[]
}> {
    const admin = getFirebaseAdmin();
    const adminDb = admin.firestore;
    
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
            // Convert Timestamps to ISO strings for serialization
            checkIn: (data.checkIn as any).toDate().toISOString(),
            checkOut: (data.checkOut as any).toDate().toISOString(),
            // Handle cases where createdAt might not exist (e.g., old data)
            createdAt: (data.createdAt as any)?.toDate()?.toISOString() || new Date(0).toISOString(),
        };
    });

    const users: SerializableUserProfile[] = usersSnapshot.docs.map(doc => doc.data() as UserProfile);
    const hotels: SerializableHotel[] = hotelsSnapshot.docs.map(doc => doc.data() as Hotel);
    
    return { bookings, users, hotels };
}
