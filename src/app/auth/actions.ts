'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { sendOTPEmail } from '@/lib/email-service';

/**
 * @fileOverview Authentication Server Actions for OTP Protocol.
 * Hardened to provide detailed error feedback and handle node failures.
 */

/**
 * Generates a 6-digit OTP, stores it in Firestore with 10-min expiry, and sends via SMTP.
 */
export async function sendSignupOTPAction(email: string, name: string) {
    const { adminDb, error: adminError } = getFirebaseAdmin();
    
    // 1. Check if Admin SDK is fully configured
    if (adminError || !adminDb) {
        console.warn("[AUTH ACTION] Admin SDK link failed:", adminError);
        return { 
            success: false, 
            message: "Himalayan Cloud Link (Admin SDK) is not fully configured. Standard registration enabled." 
        };
    }

    try {
        // 2. Generate 6-digit Protocol Code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins expiry node

        // 3. Secure Temporary Node Storage
        try {
            await adminDb.collection('temp_otps').doc(email).set({
                otp,
                expiresAt,
                createdAt: new Date().toISOString()
            });
        } catch (dbErr: any) {
            console.error("[OTP DB ERROR]:", dbErr.message);
            return { success: false, message: `Cloud Node Error: ${dbErr.message}` };
        }

        // 4. Dispatch via SMTP Service
        try {
            await sendOTPEmail(email, otp, name);
        } catch (mailErr: any) {
            console.error("[OTP MAIL ERROR]:", mailErr.message);
            return { 
                success: false, 
                message: `SMTP Failure: ${mailErr.message}. Please use 'Join Directly' if available.` 
            };
        }

        return { 
            success: true, 
            message: "Protocol code dispatched to your email node. Please check your inbox." 
        };
    } catch (e: any) {
        console.error("[OTP CRITICAL ERROR]:", e.message);
        return { 
            success: false, 
            message: "Critical Node failure. Standard registration mode suggested." 
        };
    }
}

/**
 * Verifies the user-provided OTP against the stored node.
 */
export async function verifyOTPAction(email: string, userOtp: string) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: "System node offline." };

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
