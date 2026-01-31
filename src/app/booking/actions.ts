'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @fileOverview Secure Booking Server Actions.
 * Handles inventory management and booking persistence using Admin SDK.
 */

export async function confirmBookingAction(data: {
    userId: string;
    hotelId: string;
    roomId: string;
    bookingId: string;
    paymentId: string;
    bookingData: any;
}) {
    const { adminDb, error: adminError } = getFirebaseAdmin();
    if (adminError || !adminDb) {
        return { success: false, error: 'Server configuration error: Could not connect to database.' };
    }

    const { userId, hotelId, roomId, bookingId, paymentId, bookingData } = data;

    try {
        const roomRef = adminDb.doc(`hotels/${hotelId}/rooms/${roomId}`);
        const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);

        await adminDb.runTransaction(async (transaction) => {
            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists) throw new Error("Room details not found in database.");

            const available = roomDoc.data()?.availableRooms ?? 0;
            if (available <= 0) {
                throw new Error("Sorry, this room just got sold out while you were paying!");
            }

            // 1. Decrement Inventory
            transaction.update(roomRef, {
                availableRooms: FieldValue.increment(-1)
            });

            // 2. Create Booking Record
            transaction.set(bookingRef, {
                ...bookingData,
                userId,
                hotelId,
                roomId,
                status: 'CONFIRMED',
                razorpayPaymentId: paymentId,
                createdAt: FieldValue.serverTimestamp(),
                // Ensure dates are stored as Firestore Timestamps
                checkIn: new Date(bookingData.checkIn),
                checkOut: new Date(bookingData.checkOut),
            });
        });

        console.log(`[BOOKING SUCCESS] ID: ${bookingId} for User: ${userId}`);
        return { success: true };
    } catch (e: any) {
        console.error("[BOOKING ERROR] Transaction Failed:", e.message);
        return { success: false, error: e.message || 'An unexpected error occurred during confirmation.' };
    }
}
