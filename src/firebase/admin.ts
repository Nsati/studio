import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * @fileOverview Production-grade Firebase Admin SDK Singleton.
 * Provides clear error messages for missing environment variables.
 */

type AdminServices = {
    adminDb: Firestore;
    adminAuth: Auth;
};

let adminInstance: AdminServices | null = null;

export function getFirebaseAdmin(): { adminDb: Firestore | null; adminAuth: Auth | null; error: string | null; } {
    if (typeof window !== 'undefined') {
        return { adminDb: null, adminAuth: null, error: "Admin SDK cannot be used on client." };
    }

    if (adminInstance) return { ...adminInstance, error: null };

    try {
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
            const errorMsg = `Missing Environment Variables: ${missing.join(', ')}. Please add them to your deployment platform settings.`;
            console.error(`[ADMIN SDK] ${errorMsg}`);
            return { adminDb: null, adminAuth: null, error: errorMsg };
        }

        // Handle private key formatting for different environments
        if (privateKey!.startsWith('"') && privateKey!.endsWith('"')) {
            privateKey = privateKey!.substring(1, privateKey!.length - 1);
        }
        
        const formattedKey = privateKey!.replace(/\\n/g, '\n').replace(/\n/g, '\n').trim();

        const app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey: formattedKey,
            }),
        });

        adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
        console.log("✅ [ADMIN SDK] Initialized successfully.");
        return { ...adminInstance, error: null };

    } catch (err: any) {
        console.error("[ADMIN SDK] Initialization Error:", err.message);
        return { adminDb: null, adminAuth: null, error: `Initialization Error: ${err.message}` };
    }
}
