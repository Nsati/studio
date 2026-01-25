
import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  // Switched to individual environment variables for robustness.
  // This avoids JSON parsing issues with .env files.
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // The private key from .env files needs to have its literal `\n` characters replaced with actual newlines.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("✅ Firebase Admin SDK initialized successfully. Server-side features enabled.");
    } catch (error: any) {
      console.error(`
        ❌ FATAL: FIREBASE ADMIN SDK INITIALIZATION FAILED
        ------------------------------------------------
        Reason: Could not initialize Firebase Admin with the provided credentials.
        Error: ${error.message}
        
        Please check your .env file and ensure the following variables are set correctly:
        - FIREBASE_PROJECT_ID
        - FIREBASE_CLIENT_EMAIL
        - FIREBASE_PRIVATE_KEY
      `);
    }
  } else {
    console.warn(`
      ⚠️ WARNING: FIREBASE ADMIN SDK NOT INITIALIZED
      ------------------------------------------------
      Reason: One or more required Firebase Admin environment variables are missing.
      (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
      
      Server-side features like live payment confirmation will be disabled.
      Please set these variables in your .env file to enable all features.
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
