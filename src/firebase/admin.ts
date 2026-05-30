
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

/**
 * Use globalThis to persist the instance across hot-reloads in development.
 * This prevents "Firestore has already been initialized" errors.
 */
const globalForFirebase = globalThis as unknown as {
    firebaseAdmin: AdminServices | undefined;
};

export function getFirebaseAdmin(): { adminDb: Firestore | null; adminAuth: Auth | null; error: string | null; } {
    // 1. Ensure this only runs on the server
    if (typeof window !== 'undefined') {
        return { adminDb: null, adminAuth: null, error: "Admin SDK restricted to server-side only." };
    }

    // 2. Return cached instance from global if available (Prevents hot-reload crashes)
    if (globalForFirebase.firebaseAdmin) {
        return { ...globalForFirebase.firebaseAdmin, error: null };
    }

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
         */
        try {
            db.settings({ ignoreUndefinedProperties: true });
        } catch (e) {
            // Settings already applied in a previous hot-reload, ignore safely.
        }
        
        const services = { adminDb: db, adminAuth: getAuth(app) };
        
        // Cache the instance in global scope during development
        if (process.env.NODE_ENV !== 'production') {
            globalForFirebase.firebaseAdmin = services;
        }

        console.log("✅ [ADMIN SDK] Production Cloud Bridge Synchronized.");
        return { ...services, error: null };

    } catch (err: any) {
        console.error("[ADMIN SDK CRITICAL]:", err.message);
        return { adminDb: null, adminAuth: null, error: `Initialization Failure: ${err.message}` };
    }
}
