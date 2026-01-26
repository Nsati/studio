
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  // The crucial fix: replace escaped newlines with actual newlines.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

let adminServices: { app: App; firestore: Firestore; auth: Auth } | null = null;
let initAttempted = false;

/**
 * Initializes the Firebase Admin SDK once.
 * Logs a detailed error and returns null if initialization fails, but does not throw.
 * This prevents server crashes due to misconfiguration.
 */
function initializeAdminInternal(): { app: App; firestore: Firestore; auth: Auth } | null {
    // If already initialized (e.g., in a hot-reload environment), return the existing instance.
    if (getApps().length > 0) {
        const app = getApps()[0];
        return { app, firestore: getFirestore(app), auth: getAuth(app) };
    }

    // Check for missing credentials and provide specific feedback.
    if (!serviceAccount.projectId) {
        console.error('[FATAL] Firebase Admin SDK init failed: `FIREBASE_PROJECT_ID` is not set in your .env file.');
        return null;
    }
    if (!serviceAccount.clientEmail) {
        console.error('[FATAL] Firebase Admin SDK init failed: `FIREBASE_CLIENT_EMAIL` is not set in your .env file.');
        return null;
    }
    if (!serviceAccount.privateKey) {
        console.error('[FATAL] Firebase Admin SDK init failed: `FIREBASE_PRIVATE_KEY` is not set in your .env file.');
        return null;
    }

    try {
        const app = initializeApp({ credential: cert(serviceAccount) });
        console.log("✅ Firebase Admin SDK initialized successfully.");
        return { app, firestore: getFirestore(app), auth: getAuth(app) };
    } catch (error: any) {
        let errorMessage = 'An unknown error occurred during Firebase Admin SDK initialization.';
        if (error.message.includes('Invalid PEM formatted message')) {
            errorMessage = 'The `FIREBASE_PRIVATE_KEY` is malformed. Please ensure it is copied correctly into your .env file, enclosed in double quotes, and uses "\\n" for newlines. It must include the "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" markers.';
        } else if (error.code === 'app/invalid-credential') {
             errorMessage = `The service account credentials (projectId, clientEmail, or privateKey) are invalid. Please check their values in your .env file. Original error: ${error.message}`;
        }
        console.error(`[FATAL] Firebase Admin SDK init failed: ${errorMessage}`);
        return null;
    }
}

/**
 * Provides access to the initialized Firebase Admin services.
 * This is a singleton that will attempt initialization only once.
 * It returns null if initialization fails, preventing server crashes.
 *
 * @returns An object with admin services, or null if initialization failed.
 */
export function getFirebaseAdmin() {
    if (!initAttempted) {
        adminServices = initializeAdminInternal();
        initAttempted = true;
    }
    return adminServices;
}
