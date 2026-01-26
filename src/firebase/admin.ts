
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// This will hold the initialized services as a singleton.
let adminServices: { app: App; firestore: Firestore; auth: Auth } | null = null;

/**
 * Initializes and returns the Firebase Admin SDK services.
 * This function will only initialize the SDK once.
 *
 * IT WILL THROW A DETAILED, FATAL ERROR if the required environment variables
 * are missing or malformed. This "fail fast, fail loud" approach ensures
* configuration issues are immediately obvious.
 *
 * @returns An object with admin services { app, firestore, auth }.
 */
export function getFirebaseAdmin() {
    // If services are already initialized, return them immediately.
    if (adminServices) {
        return adminServices;
    }

    // If in a hot-reload environment, connect to the existing app.
    if (getApps().length > 0) {
        const app = getApps()[0];
        adminServices = { app, firestore: getFirestore(app), auth: getAuth(app) };
        return adminServices;
    }

    // --- Step 1: Check for all required environment variables ---
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (!serviceAccount.projectId) {
        throw new Error('[FATAL] Firebase Admin SDK init failed: `FIREBASE_PROJECT_ID` is not set in your .env file.');
    }
    if (!serviceAccount.clientEmail) {
        throw new Error('[FATAL] Firebase Admin SDK init failed: `FIREBASE_CLIENT_EMAIL` is not set in your .env file.');
    }
    if (!serviceAccount.privateKey) {
        throw new Error('[FATAL] Firebase Admin SDK init failed: `FIREBASE_PRIVATE_KEY` is not set in your .env file.');
    }

    // --- Step 2: Attempt to initialize the SDK with the credentials ---
    try {
        const app = initializeApp({
            credential: cert({
                projectId: serviceAccount.projectId,
                clientEmail: serviceAccount.clientEmail,
                // The crucial fix: replace escaped newlines with actual newlines.
                privateKey: serviceAccount.privateKey.replace(/\\n/g, '\n'),
            }),
        });

        console.log("✅ Firebase Admin SDK initialized successfully.");
        adminServices = { app, firestore: getFirestore(app), auth: getAuth(app) };
        return adminServices;

    } catch (error: any) {
        let detailedError = 'An unknown error occurred.';
        if (error.message.includes('Invalid PEM formatted message')) {
            detailedError = 'The `FIREBASE_PRIVATE_KEY` is malformed. Please ensure it is copied correctly into your .env file, enclosed in double quotes, and uses "\\n" for newlines. It must include the "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" markers.';
        } else if (error.code === 'app/invalid-credential') {
             detailedError = `The service account credentials (projectId, clientEmail, or privateKey) are invalid. Please check their values in your .env file. Original error: ${error.message}`;
        }
        // Throw a new, more descriptive error that will crash the request and be visible to the user.
        throw new Error(`[FATAL] Firebase Admin SDK init failed: ${detailedError}`);
    }
}
