'use client';

import { useState, useEffect } from 'react';
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

import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
}

// This is the provider component that will wrap the app
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [services, setServices] = useState<FirebaseServices | undefined>(undefined);

  useEffect(() => {
    // This hook only runs ONCE on the client, after the initial render.
    if (firebaseConfig.apiKey) {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        setServices({ firebaseApp: app, auth, firestore });
    }
  }, []);

  return (
    <FirebaseProvider value={services}>
      {children}
    </FirebaseProvider>
  );
}
