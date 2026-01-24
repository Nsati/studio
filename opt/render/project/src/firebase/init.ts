import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './config';

// This function is designed to work in both client and server environments.
// It ensures the Firebase app is initialized only once.
export function initializeFirebaseApp(): FirebaseApp {
  if (!firebaseConfig.apiKey) {
    throw new Error(
      'Firebase config is not set. Please add the config to firebase/config.ts'
    );
  }

  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }
  
  return initializeApp(firebaseConfig);
}
