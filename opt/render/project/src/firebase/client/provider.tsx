'use client';

import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// These imports are for their side-effects. They must be here.
import 'firebase/auth';
import 'firebase/firestore';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config';

// Define the context shape
export interface FirebaseContextType {
  firebaseApp?: FirebaseApp;
  auth?: Auth;
  firestore?: Firestore;
}

// Create the context
export const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

// The main client provider that initializes and manages Firebase services
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<FirebaseContextType | undefined>(
    undefined
  );

  useEffect(() => {
    if (firebaseConfig.apiKey) {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setServices({ firebaseApp: app, auth, firestore });
    }
  }, []);

  return (
    <FirebaseContext.Provider value={services}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Custom hooks to access the services, safe for use in any client component.
function useFirebase(): FirebaseContextType | undefined {
  const context = useContext(FirebaseContext);
  // No error throwing here. This is safe for SSR.
  return context;
}

export function useFirebaseApp(): FirebaseApp | undefined {
  return useFirebase()?.firebaseApp;
}

export function useAuth(): Auth | undefined {
  return useFirebase()?.auth;
}

export function useFirestore(): Firestore | undefined {
  return useFirebase()?.firestore;
}
