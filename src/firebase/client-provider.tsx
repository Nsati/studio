
'use client';

import { useMemo } from 'react';
import { firebaseApp } from './init';
import { FirebaseProvider } from './provider';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// IMPORTANT: These MUST be the first imports to ensure services are registered
// before they are used, especially in a client component context.
import 'firebase/auth';
import 'firebase/firestore';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth, firestore } = useMemo(() => {
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    return { auth, firestore };
  }, []);

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
