import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!serviceAccountString) {
    throw new Error(`
      FATAL: FIREBASE ADMIN SDK INITIALIZATION FAILED
      ------------------------------------------------
      Reason: The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.
      This variable is required for server-side Firebase operations (like webhooks and secure actions).
      
      To fix this:
      1. Go to your Firebase Project Settings -> Service Accounts.
      2. Generate a new private key and download the JSON file.
      3. Copy the ENTIRE content of that JSON file.
      4. Paste it as the value for GOOGLE_APPLICATION_CREDENTIALS_JSON in your .env file.
      
      Example .env file:
      GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type": "service_account", "project_id": "...", ...}'
    `);
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
      throw new Error(`
        FATAL: FIREBASE ADMIN SDK INITIALIZATION FAILED
        ------------------------------------------------
        Reason: Failed to parse the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.
        Error: ${error.message}
        
        Please ensure the JSON content is copied correctly and is a valid single-line JSON string.
      `);
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
