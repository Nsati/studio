'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { sendOTPEmail } from '@/lib/email-service';

/**
 * @fileOverview Authentication Server Actions for OTP Protocol.
 * Hardened for Port 587 / TLS handshake.
 */

/**
 * Generates a 6-digit OTP, stores it in Firestore with 10-min expiry, and sends via SMTP.
 */
export async function sendSignupOTPAction(email: string, name: string) {
    const { adminDb, error: adminError } = getFirebaseAdmin();
    
    if (adminError || !adminDb) {
        return { 
            success: false, 
            message: "Himalayan Cloud Link (Admin SDK) is not configured. Redirecting to Direct Join..." 
        };
    }

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; 

        // 1. Storage Node Sync
        await adminDb.collection('temp_otps').doc(email).set({
            otp,
            expiresAt,
            createdAt: new Date().toISOString()
        });

        // 2. SMTP Handshake Node
        try {
            await sendOTPEmail(email, otp, name);
        } catch (mailErr: any) {
            console.error("[OTP MAIL ERROR]:", mailErr.message);
            return { 
                success: false, 
                message: "SMTP Protocol Denied. Check Gmail App Password or use Direct Join." 
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
            message: "Critical failure in verification protocol." 
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

        if (Date.now() > expiresAt) {
            await adminDb.collection('temp_otps').doc(email).delete();
            return { success: false, message: "Verification protocol expired. Please re-initiate." };
        }

        if (otp !== userOtp) {
            return { success: false, message: "Invalid verification code sequence." };
        }

        await adminDb.collection('temp_otps').doc(email).delete();
        return { success: true };
    } catch (e: any) {
        console.error("[OTP VERIFY ERROR]:", e.message);
        return { success: false, message: "Verification logic failure." };
    }
}
