'use client';

import { useState, useEffect } from 'react';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// We import the functions directly
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// We import the initialized app
import { firebaseApp } from './init';
import { FirebaseProvider } from './provider';

// This is the provider component that will wrap the app
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [services, setServices] = useState<{ auth: Auth; firestore: Firestore } | null>(null);

  useEffect(() => {
    // This hook only runs ONCE on the client, after the initial render.
    // This is the safest place to initialize client-side libraries.
    
    // We get the instances of the services here.
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    
    // We set them in the state.
    setServices({ auth, firestore });

  }, []); // The empty dependency array ensures this runs only once.

  if (!services) {
    // On the server, and on the first client render, 'services' will be null.
    // So we render nothing (or a loader). This prevents any child components
    // from trying to use Firebase services before they are ready.
    return null;
  }

  // Once the useEffect has run, 'services' is populated, and we can render
  // the actual provider with the services.
  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={services.firestore} auth={services.auth}>
      {children}
    </FirebaseProvider>
  );
}
