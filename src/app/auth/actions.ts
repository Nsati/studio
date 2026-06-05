
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { sendOTPEmail } from '@/lib/email-service';

/**
 * @fileOverview Authentication Server Actions for OTP Verification.
 */

export async function sendSignupOTPAction(email: string, name: string) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: "Server connection failed." };

    try {
        // 1. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins expiry

        // 2. Store in temporary collection
        await adminDb.collection('temp_otps').doc(email).set({
            otp,
            expiresAt,
            createdAt: new Date().toISOString()
        });

        // 3. Send Email
        await sendOTPEmail(email, otp, name);

        return { success: true, message: "Verification code sent to your email node." };
    } catch (e: any) {
        console.error("[OTP ACTION ERROR]:", e.message);
        return { success: false, message: "Failed to dispatch OTP. Please check email address." };
    }
}

export async function verifyOTPAction(email: string, userOtp: string) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: "Server offline." };

    try {
        const otpDoc = await adminDb.collection('temp_otps').doc(email).get();
        if (!otpDoc.exists) return { success: false, message: "OTP session expired. Please request again." };

        const { otp, expiresAt } = otpDoc.data()!;

        if (Date.now() > expiresAt) {
            await adminDb.collection('temp_otps').doc(email).delete();
            return { success: false, message: "Verification code expired." };
        }

        if (otp !== userOtp) {
            return { success: false, message: "Invalid verification code entered." };
        }

        // Cleanup after success
        await adminDb.collection('temp_otps').doc(email).delete();
        return { success: true };
    } catch (e: any) {
        return { success: false, message: "Verification logic error." };
    }
}
