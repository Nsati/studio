'use client';

import './server-block'; // Import server guard

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// These imports are for their side-effects, which register the services.
// They must be here to ensure services are available on the client.
import 'firebase/auth';
import 'firebase/firestore';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config';

// Define the context shape
interface FirebaseContextType {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Create the context
const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

// Define the provider component
function FirebaseProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: FirebaseContextType | undefined;
}) {
  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

// The main client provider that initializes and manages Firebase services
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<FirebaseContextType | undefined>(
    undefined
  );

  useEffect(() => {
    // This hook runs ONLY on the client, after the initial render.
    if (firebaseConfig.apiKey) {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setServices({ firebaseApp: app, auth, firestore });
    }
  }, []);

  return <FirebaseProvider value={services}>{children}</FirebaseProvider>;
}

// Custom hook to access the full context value.
// It's server-safe: returns `undefined` during SSR instead of crashing.
function useFirebase(): FirebaseContextType | undefined {
  return useContext(FirebaseContext);
}

// Custom hooks for specific services, safe for use in any client component.
export function useFirebaseApp(): FirebaseApp | undefined {
  return useFirebase()?.firebaseApp;
}

export function useAuth(): Auth | undefined {
  return useFirebase()?.auth;
}

export function useFirestore(): Firestore | undefined {
  return useFirebase()?.firestore;
}
