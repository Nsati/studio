import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

type AdminServices = {
    adminDb: Firestore;
    adminAuth: Auth;
};

// Singleton instance holder
let adminInstance: AdminServices | null = null;
let initError: string | null = null;

/**
 * Initializes and returns the Firebase Admin SDK services.
 * Optimized for robustness in Next.js Server Actions.
 */
export function getFirebaseAdmin(): { adminDb: Firestore | null; adminAuth: Auth | null; error: string | null; } {
    // Return cached services
    if (adminInstance) return { ...adminInstance, error: null };
    
    // Return cached error
    if (initError) return { adminDb: null, adminAuth: null, error: initError };

    try {
        // Handle existing app in hot-reload
        if (getApps().length > 0) {
            const app = getApps()[0];
            adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
            return { ...adminInstance, error: null };
        }

        const projectId = process.env.FIREBASE_PROJECT_ID;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        if (!projectId || !clientEmail || !privateKey) {
            const missing = [
                !projectId && 'FIREBASE_PROJECT_ID',
                !clientEmail && 'FIREBASE_CLIENT_EMAIL',
                !privateKey && 'FIREBASE_PRIVATE_KEY'
            ].filter(Boolean).join(', ');
            
            initError = `Missing required Admin credentials: ${missing}`;
            console.error(`[ADMIN SDK] ${initError}`);
            return { adminDb: null, adminAuth: null, error: initError };
        }

        // Clean private key formatting (essential for production deployments)
        const formattedKey = privateKey.replace(/\\n/g, '\n').trim();

        const app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey: formattedKey,
            }),
        });

        console.log("✅ [ADMIN SDK] Initialized successfully for project:", projectId);
        adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
        return { ...adminInstance, error: null };

    } catch (err: any) {
        initError = `Initialization failed: ${err.message}`;
        console.error("[ADMIN SDK] FATAL ERROR:", err.message);
        return { adminDb: null, adminAuth: null, error: initError };
    }
}
