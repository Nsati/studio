'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T>(ref: DocumentReference<DocumentData> | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Validation to ensure the reference is memoized using useMemoFirebase
  if (ref && !(ref as any).__memo) {
    throw new Error(ref + ' was not properly memoized using useMemoFirebase');
  }

  useEffect(() => {
    if (!ref) {
      setData(null);
      setIsLoading(true);
      return;
    }

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
            path: ref?.path || 'unknown',
            operation: 'get',
        });

        setTimeout(() => {
          errorEmitter.emit('permission-error', permissionError);
        }, 0);

        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, isLoading, error };
}
