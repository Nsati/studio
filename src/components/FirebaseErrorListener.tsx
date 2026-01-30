'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileOverview Listens for globally emitted 'permission-error' events.
 * Uses a deferred state update to prevent "Cannot update during render" errors.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleError = (err: FirestorePermissionError) => {
      if (!mounted) return;
      
      // DEFER: Push the state update to the next event loop tick.
      // This is the correct way to handle side-effect state updates triggered by child renders.
      setTimeout(() => {
        if (mounted) {
          console.error("🔴 [FIREBASE ERROR LISTENER] CAPTURED DENIAL:", err.request.path);
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
    // This will be caught by the nearest Next.js error boundary or error.js file.
    throw error;
  }

  return null;
}