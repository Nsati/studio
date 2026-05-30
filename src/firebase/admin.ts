
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * @fileOverview Production-grade Firebase Admin SDK Singleton.
 * Hardened to handle Next.js development hot-reloads and Firestore settings limits.
 */

type AdminServices = {
    adminDb: Firestore;
    adminAuth: Auth;
};

let adminInstance: AdminServices | null = null;

export function getFirebaseAdmin(): { adminDb: Firestore | null; adminAuth: Auth | null; error: string | null; } {
    // 1. Ensure this only runs on the server
    if (typeof window !== 'undefined') {
        return { adminDb: null, adminAuth: null, error: "Admin SDK restricted to server-side only." };
    }

    // 2. Return cached instance if available
    if (adminInstance) return { ...adminInstance, error: null };

    try {
        let app: App;
        const existingApps = getApps();

        // 3. Initialize or retrieve existing app
        if (existingApps.length > 0) {
            app = existingApps[0];
        } else {
            const projectId = process.env.FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;

            if (!projectId || !clientEmail || !privateKey) {
                const errorMsg = "Critical: Server Environment Variables Missing (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY).";
                return { adminDb: null, adminAuth: null, error: errorMsg };
            }

            // Production Hardening: Bulletproof private key parsing
            let formattedKey = privateKey.trim();
            if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
                formattedKey = formattedKey.substring(1, formattedKey.length - 1);
            }
            formattedKey = formattedKey.replace(/\\n/g, '\n');

            app = initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey: formattedKey,
                }),
            });
        }

        const db = getFirestore(app);
        
        /**
         * 4. Optimization: Ignore undefined values globally.
         * IMPORTANT: settings() can only be called once per Firestore instance.
         * In Next.js dev mode, this file might re-run, so we catch the error if already initialized.
         */
        try {
            db.settings({ ignoreUndefinedProperties: true });
        } catch (e) {
            // Settings already applied in a previous hot-reload, we can safely proceed.
        }
        
        adminInstance = { adminDb: db, adminAuth: getAuth(app) };
        console.log("✅ [ADMIN SDK] Production Cloud Bridge Synchronized.");
        return { ...adminInstance, error: null };

    } catch (err: any) {
        console.error("[ADMIN SDK CRITICAL]:", err.message);
        return { adminDb: null, adminAuth: null, error: `Initialization Failure: ${err.message}` };
    }
}
