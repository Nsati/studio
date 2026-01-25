import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK.
 * This function is idempotent and can be safely called multiple times.
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return; // Already initialized
  }

  const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (serviceAccountString) {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error(`
        ❌ FATAL: FIREBASE ADMIN SDK INITIALIZATION FAILED
        ------------------------------------------------
        Reason: Failed to parse the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.
        Error: ${error.message}
        
        Please ensure the JSON content is copied correctly and is a valid single-line JSON string.
        The server will run, but backend operations will fail.
      `);
    }
  } else {
    console.warn(`
      ⚠️ WARNING: FIREBASE ADMIN SDK NOT INITIALIZED
      ------------------------------------------------
      Reason: The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.
      This is required for server-side operations (like payment confirmation).
      
      To enable these features:
      1. Go to your Firebase Project Settings -> Service Accounts.
      2. Generate a new private key and download the JSON file.
      3. Copy the ENTIRE content of that JSON file.
      4. Paste it as the value for GOOGLE_APPLICATION_CREDENTIALS_JSON in your .env file.
      
      The server will run, but backend operations will be disabled.
    `);
  }
}

/**
 * Lazily initializes and returns the Firestore admin instance.
 * @returns The Firestore admin instance, or null if initialization fails.
 */
export function getAdminDb(): admin.firestore.Firestore | null {
    initializeFirebaseAdmin();
    if (admin.apps.length === 0) {
        return null;
    }
    return admin.firestore();
}

/**
 * Lazily initializes and returns the Auth admin instance.
 * @returns The Auth admin instance, or null if initialization fails.
 */
export function getAdminAuth(): admin.auth.Auth | null {
    initializeFirebaseAdmin();
    if (admin.apps.length === 0) {
        return null;
    }
    return admin.auth();
}
