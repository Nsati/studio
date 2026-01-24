'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type Query,
  type DocumentData,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { useFirestore } from '@/firebase/client/provider';

export function useCollection<T>(query: Query<DocumentData> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(true); // Set to true if query is not yet available
      return;
    }

    setIsLoading(true); // Ensure loading is true when a new query comes in
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
  }, [query]);

  return { data, isLoading, error };
}
