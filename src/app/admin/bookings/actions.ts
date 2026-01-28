
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking, Room } from '@/lib/types';
import type { WithId } from '@/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

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

type CancelBookingResult = {
    success: boolean;
    message: string;
};

/**
 * A secure server action for an admin to cancel any booking.
 */
export async function adminCancelBooking(userId: string, bookingId: string): Promise<CancelBookingResult> {
    const { adminDb, error: adminError } = getFirebaseAdmin();

    if (adminError || !adminDb) {
        console.error('Cancellation Error: Firebase Admin SDK not initialized.', adminError);
        return { success: false, message: 'Server is not configured correctly.' };
    }

    const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);

    try {
        await adminDb.runTransaction(async (transaction) => {
            const bookingDoc = await transaction.get(bookingRef);
            if (!bookingDoc.exists) {
                throw new Error("Booking does not exist.");
            }
            
            const bookingData = bookingDoc.data() as Booking;

            if (bookingData.status === 'CANCELLED') {
                return; // Idempotent: already cancelled
            }
            
            // If the booking was confirmed, release room inventory.
            if (bookingData.status === 'CONFIRMED') {
                const roomRef = adminDb.doc(`hotels/${bookingData.hotelId}/rooms/${bookingData.roomId}`);
                // Check if room exists before trying to update it
                const roomDoc = await transaction.get(roomRef);
                if (roomDoc.exists) {
                    transaction.update(roomRef, { availableRooms: FieldValue.increment(1) });
                }
            }
            
            // Finally, update the booking status to CANCELLED.
            transaction.update(bookingRef, { status: 'CANCELLED' });
        });

        revalidatePath('/admin/bookings');

        return { success: true, message: 'Booking successfully cancelled.' };
    } catch (error: any) {
        console.error(`Failed to cancel booking ${bookingId} for user ${userId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred during cancellation.' };
    }
}
