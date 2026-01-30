'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type Query,
  type DocumentData,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(query: Query<DocumentData> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Validation to ensure the query is memoized using useMemoFirebase
  if (query && !(query as any).__memo) {
    throw new Error(query + ' was not properly memoized using useMemoFirebase');
  }

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(true);
      return;
    }

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
        let path = 'unknown';
        try {
          // Safely attempt to extract path or collection group ID
          const q = query as any;
          path = q._query?.path?.segments?.join('/') || q.path || (q._query?.collectionGroup ? `collectionGroup('${q._query.collectionGroup}')` : 'query');
        } catch (e) {
          // Fallback if internal structure changes
        }

        const permissionError = new FirestorePermissionError({
            path: path,
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
