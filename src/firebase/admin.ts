
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Replace escaped newlines
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
    if (getApps().length > 0) {
        const app = getApps()[0];
        return { app, firestore: getFirestore(app), auth: getAuth(app) };
    }

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
        console.error(
            '[FATAL] Firebase Admin SDK credentials are not fully configured. ' +
            'Please ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set in your .env file. ' +
            'Server-side features like payment confirmation and admin tools will be disabled.'
        );
        return null;
    }

    try {
        const app = initializeApp({ credential: cert(serviceAccount) });
        return { app, firestore: getFirestore(app), auth: getAuth(app) };
    } catch (error: any) {
        let errorMessage = 'An unknown error occurred during Firebase Admin SDK initialization.';
        if (error.message.includes('Invalid PEM formatted message')) {
            errorMessage = 'Failed to initialize Firebase Admin SDK: The private key is malformed. ' +
                'Please ensure the FIREBASE_PRIVATE_KEY in your .env file is correctly formatted. ' +
                'It should be a single-line string with "\\n" for newlines, and must include the ' +
                '"-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" markers.';
        }
        console.error(`[FATAL] FIREBASE ADMIN INIT FAILED: ${errorMessage} Original error: ${error.message}`);
        console.error('Server-side features like payment confirmation and admin tools will be disabled.');
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
