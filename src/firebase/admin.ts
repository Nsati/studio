import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

if (!admin.apps.length) {
  const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (serviceAccountString) {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      adminDb = admin.firestore();
      adminAuth = admin.auth();
      console.log("✅ Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error(`
        ❌ FATAL: FIREBASE ADMIN SDK INITIALIZATION FAILED
        ------------------------------------------------
        Reason: Failed to parse the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.
        Error: ${error.message}
        
        Please ensure the JSON content is copied correctly and is a valid single-line JSON string.
        The server will run, but backend operations like payment confirmation will fail.
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
} else {
    // If already initialized (e.g. in a hot-reload scenario), just get the instances.
    adminDb = admin.firestore();
    adminAuth = admin.auth();
}


export { adminDb, adminAuth };
