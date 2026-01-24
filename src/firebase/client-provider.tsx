'use client';

// IMPORTANT: These imports must be here.
// They register the Auth and Firestore services with the Firebase app instance.
// This file is the root client-side entry point for Firebase, and because
// Next.js renders Client Components on the server first (for SSR), these
// imports will run in that server context, ensuring the services are available
// when initializeFirebase() is called during the SSR pass.
import 'firebase/auth';
import 'firebase/firestore';

import { initializeFirebase } from './init';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseApp, firestore, auth } = initializeFirebase();

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
}
