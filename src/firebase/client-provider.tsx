'use client';

import { useState, useEffect } from 'react';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { firebaseApp } from './init';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [services, setServices] = useState<{ auth: Auth; firestore: Firestore } | null>(null);

  useEffect(() => {
    // This hook only runs on the client, after the initial server render.
    const initialize = async () => {
        // Import services here for their side-effects
        const { getAuth } = await import('firebase/auth');
        const { getFirestore } = await import('firebase/firestore');

        setServices({
            auth: getAuth(firebaseApp),
            firestore: getFirestore(firebaseApp),
        });
    };

    initialize();
  }, []);

  if (!services) {
    // While services are initializing, you can show a loader or nothing.
    // Returning null prevents children from rendering and trying to access Firebase.
    // For a better UX, you could return a full-page loader skeleton.
    return null;
  }

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={services.firestore} auth={services.auth}>
      {children}
    </FirebaseProvider>
  );
}
