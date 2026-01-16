'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

export function FirebaseProvider({
  children,
  ...services
}: { children: ReactNode } & FirebaseContextType) {
  return (
    <FirebaseContext.Provider value={services}>
      {children}
    </FirebaseContext.Provider>
  );
}

function useFirebase(): FirebaseContextType {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp(): FirebaseApp {
  return useFirebase().firebaseApp;
}

export function useFirestore(): Firestore {
  return useFirebase().firestore;
}

export function useAuth(): Auth {
  return useFirebase().auth;
}

// Client-only provider. In Next.js, this is the one you'll likely use.
export { FirebaseClientProvider } from './client-provider';
