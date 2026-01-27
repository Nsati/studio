
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking, Room } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

// Define a result type for the server action
type CancelBookingResult = {
    success: boolean;
    message: string;
};

/**
 * A server action to cancel a booking using the Firebase Admin SDK.
 * This is secure as it runs on the server and bypasses client-side security rules.
 */
export async function cancelBookingAction(userId: string, bookingId: string): Promise<CancelBookingResult> {
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
                // This is not an error, just an idempotent action.
                return;
            }
            
            // If the booking was confirmed, we need to release the room inventory.
            if (bookingData.status === 'CONFIRMED') {
                const roomRef = adminDb.doc(`hotels/${bookingData.hotelId}/rooms/${bookingData.roomId}`);
                const roomDoc = await transaction.get(roomRef);
                if (roomDoc.exists) { // Corrected: .exists is a property on Admin SDK, not a function
                    transaction.update(roomRef, { availableRooms: FieldValue.increment(1) });
                }
            }
            
            // Finally, update the booking status to CANCELLED.
            transaction.update(bookingRef, { status: 'CANCELLED' });
        });

        return { success: true, message: 'Booking successfully cancelled.' };
    } catch (error: any) {
        console.error(`Failed to cancel booking ${bookingId} for user ${userId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred during cancellation.' };
    }
}
