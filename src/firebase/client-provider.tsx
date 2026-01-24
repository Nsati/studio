'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // This effect runs only once on the client after mounting
    try {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        setServices({ firebaseApp: app, auth, firestore });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        // In a real app, you might want to show a more user-friendly error UI
    }
  }, []); // Empty dependency array ensures this runs once on the client

  if (!services) {
    // While services are being initialized (and during SSR), show a loader.
    // This prevents child components from trying to use Firebase before it's ready.
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <p>Connecting to services...</p>
        </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
