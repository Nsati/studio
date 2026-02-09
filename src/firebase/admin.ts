
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * @fileOverview Production-grade Firebase Admin SDK Singleton.
 * Hardened for environment variable parsing and multi-invocation stability.
 */

type AdminServices = {
    adminDb: Firestore;
    adminAuth: Auth;
};

let adminInstance: AdminServices | null = null;

export function getFirebaseAdmin(): { adminDb: Firestore | null; adminAuth: Auth | null; error: string | null; } {
    // 1. Safety check for browser environment
    if (typeof window !== 'undefined') {
        return { adminDb: null, adminAuth: null, error: "Admin SDK cannot be used on client." };
    }

    // 2. Singleton check
    if (adminInstance) return { ...adminInstance, error: null };

    try {
        // 3. Reuse existing app if already initialized
        if (getApps().length > 0) {
            const app = getApps()[0];
            adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
            return { ...adminInstance, error: null };
        }

        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        const missing = [];
        if (!projectId) missing.push('FIREBASE_PROJECT_ID');
        if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
        if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');

        if (missing.length > 0) {
            const errorMsg = `Critical: Missing Environment Variables [${missing.join(', ')}]. Deployment requires these for production access.`;
            console.error(`[ADMIN SDK] ${errorMsg}`);
            return { adminDb: null, adminAuth: null, error: errorMsg };
        }

        // 4. Hardened Private Key Normalization
        let formattedKey = privateKey!;
        
        // Remove surrounding quotes if they exist
        if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
            formattedKey = formattedKey.substring(1, formattedKey.length - 1);
        }
        
        // Properly handle escaped newlines
        formattedKey = formattedKey.replace(/\\n/g, '\n');

        // 5. Initialize Firebase App
        const app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey: formattedKey,
            }),
        });

        adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
        console.log("✅ [ADMIN SDK] Production Node Connected Successfully.");
        return { ...adminInstance, error: null };

    } catch (err: any) {
        console.error("[ADMIN SDK CRITICAL FAILURE]:", err.message);
        return { adminDb: null, adminAuth: null, error: `Initialization Error: ${err.message}` };
    }
}
