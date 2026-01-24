'use client';

import { initializeFirebaseApp } from './init';
import { FirebaseProvider } from './provider';

// IMPORTANT: These imports must be here for their side-effects of registering
// the respective services. They are essential for Next.js SSR to work correctly.
import 'firebase/auth';
import 'firebase/firestore';

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebaseApp = initializeFirebaseApp();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

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
