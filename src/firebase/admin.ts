import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * @fileOverview Production-grade Firebase Admin SDK Singleton.
 * Ensures consistent initialization across serverless execution environments.
 */

type AdminServices = {
    adminDb: Firestore;
    adminAuth: Auth;
};

let adminInstance: AdminServices | null = null;

export function getFirebaseAdmin(): { adminDb: Firestore | null; adminAuth: Auth | null; error: string | null; } {
    if (typeof window !== 'undefined') {
        return { adminDb: null, adminAuth: null, error: "Admin SDK cannot be initialized on the client." };
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
            console.error("[ADMIN SDK] Missing credentials.");
            return { adminDb: null, adminAuth: null, error: "Cloud environment variables (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY) are missing." };
        }

        // Production-ready private key parsing
        // 1. Remove surrounding quotes if they exist
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }
        // 2. Unescape newline characters
        const formattedKey = privateKey.replace(/\\n/g, '\n').trim();

        const app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey: formattedKey,
            }),
        });

        adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
        console.log("✅ [ADMIN SDK] Success: Node environment connected.");
        return { ...adminInstance, error: null };

    } catch (err: any) {
        console.error("[ADMIN SDK] Critical Failure:", err.message);
        return { adminDb: null, adminAuth: null, error: "Firebase Admin failed to start: " + err.message };
    }
}
