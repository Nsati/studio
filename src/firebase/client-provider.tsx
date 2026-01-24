'use client';

import { useState, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { initializeApp, getApps, getApp } from 'firebase/app';
// These imports are for their side-effects, which register the services.
// They must be here to ensure services are available on the client.
import 'firebase/auth';
import 'firebase/firestore';
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

  if (!services) {
    // On the server, and on the first client render, 'services' will be null.
    // This prevents any child components from trying to use Firebase services
    // before they are ready, which is crucial for SSR.
    return null;
  }

  // Once the useEffect has run, 'services' is populated, and we can render
  // the actual provider with the services.
  return (
    <FirebaseProvider firebaseApp={services.app} firestore={services.firestore} auth={services.auth}>
      {children}
    </FirebaseProvider>
  );
}
