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
    if (adminInstance) return { ...adminInstance, error: null };

    try {
        if (getApps().length > 0) {
            const app = getApps()[0];
            adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
            return { ...adminInstance, error: null };
        }

        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            console.error("[ADMIN SDK] Missing environment variables for initialization.");
            return { adminDb: null, adminAuth: null, error: "Cloud configuration incomplete." };
        }

        // Essential for handling newlines in environment variables properly
        const formattedKey = privateKey.replace(/\\n/g, '\n').trim();

        const app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey: formattedKey,
            }),
        });

        adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
        console.log("✅ [ADMIN SDK] Initialized for project:", projectId);
        return { ...adminInstance, error: null };

    } catch (err: any) {
        console.error("[ADMIN SDK] Critical Initialization Error:", err.message);
        return { adminDb: null, adminAuth: null, error: err.message };
    }
}
