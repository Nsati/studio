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


// --- Consolidating hooks for user and data fetching ---

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth,
      (firebaseUser) => {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }

        if (firebaseUser) {
          setUser(firebaseUser);

          if (firebaseUser.isAnonymous) {
            setUserProfile(null);
            setIsLoading(false);
            setError(null);
          } else {
            setIsLoading(true);
            const profileRef = doc(firestore, 'users', firebaseUser.uid);

            unsubscribeProfile = onSnapshot(profileRef,
                (snapshot) => {
                    setUserProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null);
                    setError(null);
                    setIsLoading(false);
                },
                (err: FirestoreError) => {
                    if (err.code === 'permission-denied') {
                      errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: profileRef.path,
                        operation: 'get',
                      }));
                    }
                    console.error(`Error fetching user profile at ${profileRef.path}:`, err);
                    setError(err);
                    setUserProfile(null);
                    setIsLoading(false);
                }
            );
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setIsLoading(false);
          setError(null);
        }
      },
      (err) => {
        console.error("Auth state listener error:", err);
        setError(err);
        setUser(null);
        setUserProfile(null);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [auth, firestore]);

  return { user, userProfile, isLoading, error };
};


// Consolidating data hooks
export type WithId<T> = T & { id: string };

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
    
    let path = 'unknown path';
    try {
        // Robust extraction of path/collectionGroup for debug reporting
        const internalQuery = (refOrQuery as any)._query;
        if (internalQuery) {
            if (internalQuery.collectionGroup) {
                path = `collectionGroup('${internalQuery.collectionGroup}')`;
            } else if (internalQuery.path) {
                path = internalQuery.path.segments.join('/');
            }
        } else if ((refOrQuery as any).path) {
            path = (refOrQuery as any).path;
        }
    } catch (e) {
        console.error("Could not determine query path", e);
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
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: path,
                operation: 'list',
            }));
        }
        console.error(`Error fetching collection for path "${path}":`, err);
        setError(err);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [refOrQuery]);

  return { data, isLoading, error };
}
