import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from './config';

type FirebaseServices = {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
};

// Use a singleton pattern to ensure initialization only happens once.
let firebaseServices: FirebaseServices | null = null;

export function initializeFirebase(): FirebaseServices {
  if (firebaseServices) {
    return firebaseServices;
  }

  if (!firebaseConfig.apiKey) {
    throw new Error(
      'Firebase config is not set. Please add the config to firebase/config.ts'
    );
  }

  const apps = getApps();
  const firebaseApp = !apps.length
    ? initializeApp(firebaseConfig)
    : apps[0];

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  firebaseServices = { firebaseApp, firestore, auth };

  return firebaseServices;
}
