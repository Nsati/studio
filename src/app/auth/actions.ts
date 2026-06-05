'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { sendOTPEmail } from '@/lib/email-service';

/**
 * @fileOverview Authentication Server Actions for OTP Protocol.
 * Hardened to handle missing Admin SDK secrets gracefully.
 */

/**
 * Generates a 6-digit OTP, stores it in Firestore with 10-min expiry, and sends via SMTP.
 */
export async function sendSignupOTPAction(email: string, name: string) {
    const { adminDb, error } = getFirebaseAdmin();
    
    // 1. Check if Admin SDK is fully configured
    if (error || !adminDb) {
        console.warn("[AUTH ACTION] Admin SDK link failed. Environment variables likely missing.");
        return { 
            success: false, 
            message: "Himalayan Cloud Link (Admin SDK) is not fully configured in environment variables. Standard registration mode enabled." 
        };
    }

    try {
        // 2. Generate 6-digit Protocol Code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins expiry node

        // 3. Secure Temporary Node Storage
        await adminDb.collection('temp_otps').doc(email).set({
            otp,
            expiresAt,
            createdAt: new Date().toISOString()
        });

        // 4. Dispatch via SMTP Service
        await sendOTPEmail(email, otp, name);

        return { 
            success: true, 
            message: "Protocol code dispatched to your email node. Please check your inbox." 
        };
    } catch (e: any) {
        console.error("[OTP ACTION ERROR]:", e.message);
        return { 
            success: false, 
            message: "Node failure: Could not dispatch OTP. Check SMTP/Firebase configuration." 
        };
    }
}

/**
 * Verifies the user-provided OTP against the stored node.
 */
export async function verifyOTPAction(email: string, userOtp: string) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: "System node offline. Use Standard Mode." };

    try {
        const otpDoc = await adminDb.collection('temp_otps').doc(email).get();
        if (!otpDoc.exists) return { success: false, message: "Verification session not found or expired." };

        const data = otpDoc.data();
        if (!data) return { success: false, message: "Node data corrupted." };

        const { otp, expiresAt } = data;

        // Check Expiry Node
        if (Date.now() > expiresAt) {
            await adminDb.collection('temp_otps').doc(email).delete();
            return { success: false, message: "Verification protocol expired. Please re-initiate." };
        }

        // Match Logic
        if (otp !== userOtp) {
            return { success: false, message: "Invalid verification code sequence." };
        }

        // Cleanup after successful protocol match
        await adminDb.collection('temp_otps').doc(email).delete();
        return { success: true };
    } catch (e: any) {
        console.error("[OTP VERIFY ERROR]:", e.message);
        return { success: false, message: "Verification logic failure." };
    }
}
