
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
 * This function is idempotent and safe to call multiple times. It will only
 * attempt to initialize the SDK once and will not throw an error, preventing server crashes.
 *
 * @returns An object containing either the admin services (`adminDb`, `adminAuth`) or an `error` string if initialization fails.
 */
export function getFirebaseAdmin(): { adminDb: Firestore | null; adminAuth: Auth | null; error: string | null; } {
    // If we've already successfully initialized, return the services.
    if (adminInstance) {
        return { adminDb: adminInstance.adminDb, adminAuth: adminInstance.adminAuth, error: null };
    }
    // If we've already tried and failed, return the cached error message immediately.
    if (initError) {
        return { adminDb: null, adminAuth: null, error: initError };
    }

    try {
        // If in a hot-reload environment like `next dev`, an app might already exist.
        if (getApps().length > 0) {
            const app = getApps()[0];
            adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
            return { ...adminInstance, error: null };
        }

        // --- Step 1: Check for all required environment variables ---
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        if (!projectId || !clientEmail || !privateKey) {
            const missingVars = [
                !projectId && 'FIREBASE_PROJECT_ID',
                !clientEmail && 'FIREBASE_CLIENT_EMAIL',
                !privateKey && 'FIREBASE_PRIVATE_KEY'
            ].filter(Boolean).join(', ');
            
            const errorMessage = `[FATAL] Firebase Admin SDK init failed: The following environment variables are missing: ${missingVars}. Please add them to your .env file.`;
            console.error(errorMessage);
            initError = 'Server is not configured for this operation. Check server logs for details.';
            return { adminDb: null, adminAuth: null, error: initError };
        }

        // --- Step 2: Attempt to initialize the SDK with the credentials ---
        const app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });

        console.log("✅ Firebase Admin SDK initialized successfully.");
        adminInstance = { adminDb: getFirestore(app), adminAuth: getAuth(app) };
        return { ...adminInstance, error: null };

    } catch (error: any) {
        let detailedError = `[FATAL] Firebase Admin SDK init failed with an unknown error: ${error.message}`;

        if (error.message.includes('Invalid PEM formatted message')) {
            detailedError = `
[FATAL] Firebase Admin SDK init failed: The \`FIREBASE_PRIVATE_KEY\` is malformed.

This is a configuration error in your .env file, not a code bug.

Please ensure the FIREBASE_PRIVATE_KEY variable looks EXACTLY like this example, including the quotes and \\n characters:

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_VERY_LONG_KEY_HERE\\n-----END PRIVATE KEY-----\n"

Original Error: ${error.message}
`;
        } else if (error.code === 'app/invalid-credential') {
             detailedError = `[FATAL] Firebase Admin SDK init failed: The service account credentials (projectId, clientEmail, or privateKey) are invalid. Please check their values in your .env file. Original error: ${error.message}`;
        }

        console.error(detailedError);
        initError = 'Server is not configured for this operation. Check server logs for a [FATAL] error message.';
        return { adminDb: null, adminAuth: null, error: initError };
    }
}
