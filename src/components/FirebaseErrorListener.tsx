'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileOverview Listens for globally emitted 'permission-error' events.
 * Fixes "Cannot update a component while rendering" by deferring state updates.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (err: FirestorePermissionError) => {
      // DEFER: Use setTimeout to push the state update to the next event loop tick.
      // This prevents the React "setState during render" warning.
      setTimeout(() => {
        setError(err);
      }, 0);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // Triggering the error boundary happens here.
  if (error) {
    throw error;
  }

  return null;
}