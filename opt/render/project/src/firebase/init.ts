
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;

// Check if a Firebase app has already been initialized.
if (!getApps().length) {
  if (!firebaseConfig.apiKey) {
    throw new Error(
      'Firebase config is not set. Please add the config to firebase/config.ts'
    );
  }
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

// This function is now deprecated but kept for compatibility.
export function initializeFirebaseApp(): FirebaseApp {
  return firebaseApp;
}

export { firebaseApp };

