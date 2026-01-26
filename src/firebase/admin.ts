
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// IMPORTANT: The service account credentials should be stored securely as environment variables.
// These placeholders will be replaced by the actual values from the .env file.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Replace escaped newlines
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Singleton pattern to avoid re-initialization
let adminServices: { app: App; firestore: Firestore; auth: Auth } | null = null;
let initError: Error | null = null; // Store initialization error

/**
 * Initializes the Firebase Admin SDK. This function is designed to be called
 * internally and will throw an error on failure, which can be caught.
 * It ensures initialization only happens once.
 */
function initializeAdmin() {
  // If already initialized successfully, return the existing services
  if (adminServices) {
    return adminServices;
  }
  // If initialization failed before, re-throw the stored error immediately
  if (initError) {
    throw initError;
  }

  // Fallback to check if an app was initialized elsewhere.
  if (getApps().length > 0) {
    const app = getApps()[0];
    adminServices = {
        app,
        firestore: getFirestore(app),
        auth: getAuth(app),
    };
    return adminServices;
  }

  // Check if all required environment variables are present
  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    initError = new Error(
      'Firebase Admin SDK credentials are not fully configured. ' +
      'Please ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set in your .env file.'
    );
    // Log a persistent warning on the server console
    console.error(`[FATAL] FIREBASE ADMIN INIT FAILED: ${initError.message}`);
    throw initError;
  }

  try {
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    adminServices = {
        app,
        firestore: getFirestore(app),
        auth: getAuth(app),
    };
    return adminServices;
  } catch (error: any) {
    if (error.message.includes('Invalid PEM formatted message')) {
        initError = new Error(
            'Failed to initialize Firebase Admin SDK: The private key is malformed. ' +
            'Please ensure the FIREBASE_PRIVATE_KEY in your .env file is correctly formatted. ' +
            'It should be a single-line string with "\\n" for newlines, and must include the ' +
            '"-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" markers. ' +
            'Original error: ' + error.message
        );
    } else {
        initError = error; // Store any other initialization error
    }
    // Log the detailed error to the server console and throw it.
    console.error(`[FATAL] FIREBASE ADMIN INIT FAILED: ${initError.message}`);
    throw initError;
  }
}

/**
 * Provides a "safe" way to get access to the initialized Firebase Admin services.
 * It will not throw an error if initialization fails due to misconfiguration.
 * Instead, it will log the error to the server console and return null.
 * Callers must check for a null return value.
 *
 * @returns An object containing the admin app, firestore, and auth services, or null if initialization failed.
 */
export function getFirebaseAdmin() {
  try {
    return initializeAdmin();
  } catch (e) {
    // initializeAdmin() already logs the detailed error.
    // We catch the thrown error and return null to the caller.
    return null;
  }
}
