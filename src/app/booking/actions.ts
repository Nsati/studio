
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

/**
 * @fileOverview Secure Booking Server Actions with Razorpay Signature Verification.
 */

export async function confirmBookingAction(data: {
    userId: string;
    hotelId: string;
    roomId: string;
    bookingId: string;
    paymentId: string;
    orderId: string;
    signature: string;
    bookingData: any;
}) {
    const { adminDb, error: adminError } = getFirebaseAdmin();
    const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (adminError || !adminDb) {
        return { success: false, error: 'Cloud database connection failed.' };
    }

    const { userId, hotelId, roomId, bookingId, paymentId, orderId, signature, bookingData } = data;

    // 1. Verify Razorpay Signature (Security First)
    if (RAZORPAY_SECRET) {
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error(`[FRAUD ALERT] Signature mismatch for User: ${userId}`);
            return { success: false, error: 'Payment verification failed. Security breach detected.' };
        }
    }

    try {
        const roomRef = adminDb.doc(`hotels/${hotelId}/rooms/${roomId}`);
        const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);

        await adminDb.runTransaction(async (transaction) => {
            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists) throw new Error("Property inventory node missing.");

            const available = roomDoc.data()?.availableRooms ?? 0;
            if (available <= 0) {
                throw new Error("Inventory exhausted during transaction.");
            }

            // Decrement Inventory
            transaction.update(roomRef, {
                availableRooms: FieldValue.increment(-1)
            });

            // Create Booking Record
            transaction.set(bookingRef, {
                ...bookingData,
                userId,
                hotelId,
                roomId,
                status: 'CONFIRMED',
                razorpayPaymentId: paymentId,
                razorpayOrderId: orderId,
                createdAt: FieldValue.serverTimestamp(),
                checkIn: new Date(bookingData.checkIn),
                checkOut: new Date(bookingData.checkOut),
            });
        });

        console.log(`[VERIFIED BOOKING] ID: ${bookingId} confirmed via Razorpay.`);
        return { success: true };
    } catch (e: any) {
        console.error("[BOOKING ERROR]:", e.message);
        return { success: false, error: e.message || 'System failure during confirmation.' };
    }
}
