
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot, DocumentData, FirestoreError, DocumentSnapshot, Query, CollectionReference, QuerySnapshot, DocumentReference } from 'firebase/firestore';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Main Firebase Context
interface FirebaseContextState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const contextValue = useMemo(() => ({
    firebaseApp,
    firestore,
    auth,
  }), [firebaseApp, firestore, auth]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};


// Hooks to access the services
export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

// Consolidated User Hook
export interface UserHookResult {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

export const useUser = (): UserHookResult => {
  const auth = useAuth();
  const firestore = useFirestore();

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Effect 1: Handle auth state changes only.
  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
      setAuthError(null);
    }, (err) => {
      console.error("Auth state listener error:", err);
      setAuthError(err);
      setIsAuthLoading(false);
    });
    return () => authUnsubscribe();
  }, [auth]);

  // Effect 2: Handle profile fetching, which depends on the user state from Effect 1.
  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    // Always reset profile state when the user object changes.
    setUserProfile(null);
    setProfileError(null);

    // Only fetch a profile if we have a user and they are NOT anonymous.
    if (user && !user.isAnonymous) {
      setIsProfileLoading(true);
      const profileRef = doc(firestore, 'users', user.uid);
      
      profileUnsubscribe = onSnapshot(profileRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
          setProfileError(null);
          setIsProfileLoading(false);
        },
        (err) => {
          if (err.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: profileRef.path,
              operation: 'get',
            }));
          }
          console.error(`Error fetching user profile at ${profileRef.path}:`, err);
          setProfileError(err);
          setIsProfileLoading(false);
        }
      );
    } else {
      // If there's no user or the user is anonymous, we are not loading a profile.
      setIsProfileLoading(false);
    }

    // Cleanup subscription on unmount or if the user changes.
    return () => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, [user, firestore]); // This effect re-runs ONLY when the `user` object changes.

  return {
    user,
    userProfile,
    isLoading: isAuthLoading || isProfileLoading,
    error: authError || profileError,
  };
};

// Consolidated Document Hook
type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | null;
}

export function useDoc<T = any>(
  docRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (err.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            }));
        }
        console.error(`Error fetching document at ${docRef.path}:`, err);
        setError(err);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, isLoading, error };
}

// Consolidated Collection Hook
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | null;
}

export function useCollection<T = any>(
    refOrQuery: (CollectionReference<DocumentData> | Query<DocumentData>)  | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!refOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      refOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: WithId<T>[] = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (err.code === 'permission-denied') {
            const path = (refOrQuery as any)._query?.path?.canonicalString() || (refOrQuery as any).path;
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: path || 'unknown path',
                operation: 'list',
            }));
        }
        console.error('Error fetching collection:', err);
        setError(err);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [refOrQuery]);

  return { data, isLoading, error };
}
