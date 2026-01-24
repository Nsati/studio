import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from './config';

type FirebaseServices = {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
};

// This function is designed to work in both client and server environments.
// On the server, it might be called multiple times for different requests,
// so we use getApps() to prevent re-initializing the app.
export function initializeFirebase(): FirebaseServices {
  if (!firebaseConfig.apiKey) {
    throw new Error(
      'Firebase config is not set. Please add the config to firebase/config.ts'
    );
  }

  const apps = getApps();
  const firebaseApp = !apps.length
    ? initializeApp(firebaseConfig)
    : apps[0];

  // The getAuth() and getFirestore() calls will now succeed because the
  // necessary services are registered via side-effect imports in the
  // FirebaseClientProvider component, which is the entry point.
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, firestore, auth };
}
