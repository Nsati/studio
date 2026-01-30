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
    let mounted = true;

    const handleError = (err: FirestorePermissionError) => {
      if (!mounted) return;
      
      // DEFER: Use setTimeout to push the state update to the next event loop tick.
      // This ensures the current render phase of the triggering component completes 
      // before the error state is updated in this component.
      setTimeout(() => {
        if (mounted) {
          console.error("🔴 FIREBASE PERMISSION ERROR CAPTURED:", err.request.path);
          setError(err);
        }
      }, 0);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      mounted = false;
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (error) {
    // Caught by Error Boundary or NextJS error UI
    throw error;
  }

  return null;
}