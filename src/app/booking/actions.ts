'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

/**
 * @fileOverview Secure Booking Server Actions with Razorpay Signature Verification.
 * Hardened to support production transactions with integrity checks.
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
    // Using environment variables strictly for production
    const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (adminError || !adminDb) {
        console.error("[CRITICAL] Booking Action failed due to missing Admin SDK context.");
        return { success: false, error: 'Cloud database synchronization failed. Please contact support.' };
    }

    const { userId, hotelId, roomId, bookingId, paymentId, orderId, signature, bookingData } = data;

    // 1. Verify Razorpay Signature (Security First)
    // We only allow simulated bypass in non-production environments with specific test prefixes
    const isSimulated = process.env.NODE_ENV !== 'production' && (paymentId.startsWith('pay_sim') || paymentId.startsWith('SIM_'));
    
    if (RAZORPAY_SECRET && !isSimulated) {
        try {
            const body = orderId + "|" + paymentId;
            const expectedSignature = crypto
                .createHmac("sha256", RAZORPAY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature !== signature) {
                console.error(`[FRAUD ALERT] Signature mismatch detected for Order: ${orderId} | User: ${userId}`);
                return { success: false, error: 'Payment verification failed. Security integrity check failed.' };
            }
        } catch (signError) {
            console.error("[SIGNATURE ERROR]:", signError);
            return { success: false, error: 'Internal verification logic error.' };
        }
    } else if (!RAZORPAY_SECRET && process.env.NODE_ENV === 'production') {
        console.error("[CRITICAL] RAZORPAY_KEY_SECRET missing in production!");
        return { success: false, error: 'Server configuration mismatch. Contact site admin.' };
    }

    try {
        const roomRef = adminDb.doc(`hotels/${hotelId}/rooms/${roomId}`);
        const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);

        await adminDb.runTransaction(async (transaction) => {
            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists) throw new Error("Property inventory node missing in cloud.");

            const available = roomDoc.data()?.availableRooms ?? 0;
            if (available <= 0) {
                throw new Error("Room inventory exhausted during the transaction process.");
            }

            // Decrement Inventory
            transaction.update(roomRef, {
                availableRooms: FieldValue.increment(-1)
            });

            // Create Booking Record with proper server timestamps and Date objects
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

        console.log(`✅ [CONFIRMED] Booking ID: ${bookingId} synchronized for user: ${userId}`);
        return { success: true };
    } catch (e: any) {
        console.error("❌ [BOOKING ERROR]:", e.message);
        return { success: false, error: e.message || 'The Tripzy server encountered a processing error during synchronization.' };
    }
}
