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
      // This ensures the current render phase completes before the error boundary is triggered.
      setTimeout(() => {
        if (mounted) {
          console.error("🔴 FIREBASE PERMISSION ERROR CAPTURED:", err.request.path);
          console.log("DEBUG AUTH:", err.request.auth);
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

  // Triggering the error boundary happens here during the NEXT render.
  if (error) {
    throw error;
  }

  return null;
}