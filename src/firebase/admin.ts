
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// IMPORTANT: The service account credentials should be stored securely as environment variables.
// These placeholders will be replaced by the actual values from the .env file.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Replace escaped newlines
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

let adminApp: App;

/**
 * Initializes and/or returns the Firebase Admin SDK instance.
 * This is a singleton pattern to ensure we don't initialize the app more than once.
 */
function initializeAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]; // Return the already initialized app
  }

  // Check if all required environment variables are present
  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    throw new Error(
      'Firebase Admin SDK credentials are not fully configured. ' +
      'Please ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set in your .env file.'
    );
  }

  try {
    // Initialize the Firebase Admin SDK
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error: any) {
    // Catch the specific PEM parsing error and provide a more helpful message.
    if (error.message.includes('Invalid PEM formatted message')) {
        throw new Error(
            'Failed to initialize Firebase Admin SDK: The private key is malformed. ' +
            'Please ensure the FIREBASE_PRIVATE_KEY in your .env file is correctly formatted. ' +
            'It should be a single-line string with "\\n" for newlines, and must include the ' +
            '"-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" markers. ' +
            'Original error: ' + error.message
        );
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Provides access to the initialized Firebase Admin services.
 * @returns An object containing the admin app, firestore, and auth services.
 */
export function getFirebaseAdmin() {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  
  return {
    app: adminApp,
    firestore: getFirestore(adminApp),
    auth: getAuth(adminApp),
  };
}
