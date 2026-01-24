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
  firebaseApp,
  firestore,
  auth
}: { children: ReactNode } & Partial<FirebaseContextType>) {
  
  const value = firebaseApp && auth && firestore 
    ? { firebaseApp, auth, firestore } 
    : undefined;

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

function useFirebase(): FirebaseContextType | undefined {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    // During SSR or before the client-side useEffect runs, the context will be undefined.
    // This is expected. We should not throw an error here.
    // The consumer hooks (useAuth, useFirestore) will handle the undefined value.
    return undefined;
  }
  return context;
}

export function useFirebaseApp(): FirebaseApp | undefined {
  return useFirebase()?.firebaseApp;
}

export function useFirestore(): Firestore | undefined {
  return useFirebase()?.firestore;
}

export function useAuth(): Auth | undefined {
  return useFirebase()?.auth;
}
