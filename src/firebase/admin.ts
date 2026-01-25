
import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (serviceAccountString) {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin SDK initialized successfully. Server-side features enabled.");
    } catch (error: any) {
      console.error(`
        ❌ FATAL: FIREBASE ADMIN SDK INITIALIZATION FAILED
        ------------------------------------------------
        Reason: Failed to parse the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.
        Error: ${error.message}
        
        This is a critical error. The server will run, but all backend operations that require admin privileges (like payment confirmation, search, etc.) will fail.
        Please ensure the JSON content in your .env file is a valid, single-line JSON string enclosed in quotes.
        
        Example .env:
        GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type": "service_account", "project_id": "...", ...}'
      `);
    }
  } else {
    console.warn(`
      ⚠️ WARNING: FIREBASE ADMIN SDK NOT INITIALIZED
      ------------------------------------------------
      Reason: The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.
      Server-side features like live payment confirmation and availability search will be disabled.
      
      To enable these features:
      1. Go to your Firebase Project Settings -> Service Accounts.
      2. Generate a new private key and download the JSON file.
      3. Copy the ENTIRE content of that JSON file.
      4. In your .env file, create a variable: GOOGLE_APPLICATION_CREDENTIALS_JSON="{...paste content here...}"
      5. Restart your server.
    `);
  }
}

export function getAdminDb(): admin.firestore.Firestore | null {
    initializeFirebaseAdmin();
    if (admin.apps.length === 0) {
        return null;
    }
    return admin.firestore();
}

export function getAdminAuth(): admin.auth.Auth | null {
    initializeFirebaseAdmin();
    if (admin.apps.length === 0) {
        return null;
    }
    return admin.auth();
}
