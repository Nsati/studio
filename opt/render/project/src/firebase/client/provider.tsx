'use client';

// This guard MUST be the first import. It throws an error if this file is
// ever imported into a Server Component.
import './server-block';

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import { 
  getFirestore, 
  onSnapshot, 
  doc, 
  collection, 
  type Firestore, 
  type DocumentData, 
  type DocumentReference, 
  type Query
} from 'firebase/firestore';

import { firebaseConfig } from '../config';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import type { UserProfile } from '@/lib/types';


// --- Context Shape and Creation ---

interface FirebaseContextType {
  auth: Auth | null;
  firestore: Firestore | null;
  isLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  auth: null,
  firestore: null,
  isLoading: true,
});

// --- Main Client Provider Component ---

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<{ auth: Auth | null, firestore: Firestore | null }>({
      auth: null,
      firestore: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (firebaseConfig.apiKey) {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setServices({ auth, firestore });
      setIsLoading(false);
    } else {
        console.error("Firebase config is missing. Firebase will not be initialized.");
        setIsLoading(false);
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ ...services, isLoading }}>
      {children}
    </FirebaseContext.Provider>
  );
}

// --- Base Hook ---

function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseClientProvider');
  }
  return context;
}

// --- Service Hooks ---

export function useAuth(): Auth | null {
  return useFirebase()?.auth;
}

export function useFirestore(): Firestore | null {
  return useFirebase()?.firestore;
}

// --- Data Hooks (useCollection, useDoc, useUser) ---

export function useCollection<T>(query: Query<DocumentData> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(false); // No query means we aren't loading anything.
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      query,
      snapshot => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setIsLoading(false);
      },
      async serverError => {
        const permissionError = new FirestorePermissionError({
            path: (query as any)._query.path.segments.join('/'),
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]); // Re-run when the query object itself changes.

  return { data, isLoading, error };
}


export function useDoc<T>(ref: DocumentReference<DocumentData> | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setIsLoading(false); // No ref means we aren't loading anything.
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      doc => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
      },
      async serverError => {
        const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]); // Re-run when the ref object itself changes.

  return { data, isLoading, error };
}

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  // START with isLoading: true. This is the key to preventing hydration errors.
  // The server will render this as loading, and the client's first render will match.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If the auth service isn't ready yet (during SSR or initial client load),
    // do nothing. The `isLoading` state will remain `true`.
    if (!auth) {
      return;
    }

    // Auth service IS ready. Set up the listener.
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      // Once we get the first response from onAuthStateChanged, we know the
      // auth state is determined. Now we can set loading to false.
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Rerun this effect if the auth object itself changes

  const userProfileRef = useMemo(() => {
    // Wait for firestore and user to be available.
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  return {
    user,
    userProfile,
    // The overall loading state is true if either the auth state is loading,
    // or if we have a user but are still loading their profile from Firestore.
    isLoading: isLoading || (!!user && isLoadingProfile),
  };
}
