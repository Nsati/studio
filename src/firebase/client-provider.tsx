
'use client';

import { firebaseApp } from './init';
import { FirebaseProvider } from './provider';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: These imports must be here for their side-effects of registering
// the respective services. They are essential for Next.js SSR to work correctly.
import 'firebase/auth';
import 'firebase/firestore';

// The services are now initialized here, within the Client Component tree.
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);


export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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

