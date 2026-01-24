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

// This is the provider component that will wrap the app
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [services, setServices] = useState<{ app: FirebaseApp, auth: Auth; firestore: Firestore } | null>(null);

  useEffect(() => {
    // This hook only runs ONCE on the client, after the initial render.
    // This is the safest place to initialize client-side libraries.
    if (firebaseConfig.apiKey) {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        setServices({ app, auth, firestore });
    }
  }, []);

  // Always render the Provider.
  // When services are null (during SSR), the context value will be `undefined`.
  // The hooks are designed to handle this undefined state gracefully.
  return (
    <FirebaseProvider 
      firebaseApp={services?.app} 
      firestore={services?.firestore} 
      auth={services?.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
