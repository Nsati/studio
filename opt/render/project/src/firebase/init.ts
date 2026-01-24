import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;

// This prevents re-initialization during hot-reloads in development and on the server.
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

export { firebaseApp };
