
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * @fileOverview Production-grade Firebase Admin SDK Singleton.
 * Hardened for robust private key parsing and hidden character handling.
 */

type AdminServices = {
    adminDb: Firestore;
    adminAuth: Auth;
};

let adminInstance: AdminServices | null = null;

export function getFirebaseAdmin(): { adminDb: Firestore | null; adminAuth: Auth | null; error: string | null; } {
    if (typeof window !== 'undefined') {
        return { adminDb: null, adminAuth: null, error: "Admin SDK restricted to server-side only." };
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

        if (!projectId || !clientEmail || !privateKey) {
            const errorMsg = "Critical: Server Environment Variables Missing (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY).";
            return { adminDb: null, adminAuth: null, error: errorMsg };
        }

        // Hardened Normalization: Handle quotes, hidden escapes, and raw newlines
        let formattedKey = privateKey.trim();
        if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
            formattedKey = formattedKey.substring(1, formattedKey.length - 1);
        }
        formattedKey = formattedKey.replace(/\\n/g, '\n');

        const app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey: formattedKey,
            }),
        });

        adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
        console.log("✅ [ADMIN SDK] Production Cloud Bridge Synchronized.");
        return { ...adminInstance, error: null };

    } catch (err: any) {
        console.error("[ADMIN SDK CRITICAL]:", err.message);
        return { adminDb: null, adminAuth: null, error: `Initialization Failure: ${err.message}` };
    }
}
