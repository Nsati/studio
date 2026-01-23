import * as admin from 'firebase-admin';

// Ensure the service account is parsed correctly
// In a Vercel/production environment, you would set GOOGLE_APPLICATION_CREDENTIALS_JSON as a single-line string.
const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!admin.apps.length) {
  if (!serviceAccountString) {
    console.warn('Firebase Admin SDK not initialized: GOOGLE_APPLICATION_CREDENTIALS_JSON is not set.');
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
      console.error('Error parsing Firebase service account JSON:', error.message);
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
