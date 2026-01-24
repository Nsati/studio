'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot, DocumentReference, Query, CollectionReference } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { UserProfile } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// --- CONTEXT STATE AND HOOK RESULT TYPES ---

interface FullUserAuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  userProfile: UserProfile | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  userError: Error | null;
}

// --- CONTEXT DEFINITION ---

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// --- PROVIDER COMPONENT ---

export const FirebaseProvider: React.FC<{
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}> = ({ children, firebaseApp, firestore, auth }) => {

  const [authState, setAuthState] = useState<FullUserAuthState>({
    user: null,
    userProfile: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!auth) {
      setAuthState({ user: null, userProfile: null, isLoading: false, error: new Error("Auth service not available.") });
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAuthState(prev => ({ ...prev, user: firebaseUser, isLoading: true, error: null }));
      } else {
        setAuthState({ user: null, userProfile: null, isLoading: false, error: null });
      }
    }, (error) => {
      console.error("FirebaseProvider: Auth state error:", error);
      setAuthState({ user: null, userProfile: null, isLoading: false, error });
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!authState.user || !firestore) {
        if(!authState.isLoading) {
            setAuthState(prev => ({...prev, userProfile: null, isLoading: false}));
        }
        return;
    }

    const userDocRef = doc(firestore, 'users', authState.user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAuthState(prev => ({ ...prev, userProfile: docSnap.data() as UserProfile, isLoading: false }));
      } else {
        setAuthState(prev => ({ ...prev, userProfile: null, isLoading: false }));
      }
    }, (error) => {
      console.error("FirebaseProvider: Profile fetch error:", error);
      setAuthState(prev => ({ ...prev, userProfile: null, isLoading: false, error: prev.error || error }));
    });

    return () => unsubscribeProfile();
  }, [authState.user, firestore]);

  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp,
    firestore,
    auth,
    user: authState.user,
    userProfile: authState.userProfile,
    isUserLoading: authState.isLoading,
    userError: authState.error,
  }), [firebaseApp, firestore, auth, authState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


// --- CORE HOOKS ---

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  if (!auth) throw new Error("Auth service is not available. This may happen during initial load.");
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  if (!firestore) throw new Error("Firestore service is not available. This may happen during initial load.");
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  if (!firebaseApp) throw new Error("Firebase App is not available. This may happen during initial load.");
  return firebaseApp;
};

export const useUser = (): UserHookResult => {
  const { user, userProfile, isUserLoading, userError } = useFirebase();
  return { user, userProfile, isLoading: isUserLoading, userError };
};


// --- UTILITY AND DATA HOOKS ---

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

export function useDoc<T>(ref: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const memoizedRef = useMemoFirebase(() => ref, [ref]);

  useEffect(() => {
    if (!memoizedRef) {
      setData(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const unsubscribe = onSnapshot(
      memoizedRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error(`useDoc error for path ${memoizedRef.path}:`, error);
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: memoizedRef.path,
            operation: 'get',
          })
        );
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedRef]);

  return { data, isLoading };
}

export function useCollection<T>(q: Query | CollectionReference | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const memoizedQuery = useMemoFirebase(() => q, [q]);

  useEffect(() => {
    if (!memoizedQuery) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      memoizedQuery,
      (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setData(documents);
        setIsLoading(false);
      },
      (error) => {
        console.error(`useCollection error:`, error);
        let path = 'unknown path';
        try {
          if ('path' in memoizedQuery && typeof memoizedQuery.path === 'string') {
              path = memoizedQuery.path;
          } else if ('_query' in memoizedQuery && (memoizedQuery as any)._query?.path) {
              path = (memoizedQuery as any)._query.path.segments.join('/');
          }
        } catch (e) { /* ignore errors trying to get path */ }
        
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: path,
            operation: 'list',
          })
        );
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, isLoading };
}
