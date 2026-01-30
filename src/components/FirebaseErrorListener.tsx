'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useUser } from '@/firebase';

/**
 * @fileOverview Listens for globally emitted 'permission-error' events.
 * Uses a deferred state update to prevent Next.js hydration issues.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const { user } = useUser();

  useEffect(() => {
    let mounted = true;

    const handleError = (err: FirestorePermissionError) => {
      if (!mounted) return;
      
      // DEFER: Push the state update to the next event loop tick.
      // This is crucial to prevent "Cannot update during render" crashes in Next.js.
      setTimeout(() => {
        if (mounted) {
          console.error("🔴 [FIREBASE ERROR LISTENER] DENIAL AT:", err.request.path);
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
    return (
      <div className="fixed bottom-4 right-4 z-[9999] max-w-md p-6 bg-destructive text-white rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <h3 className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-80">Security Protocol Warning</h3>
        <p className="font-bold text-sm leading-relaxed">
          Access Denied: <strong>{user?.email || 'Current User'}</strong> is not authorized. Update <code>firestore.rules</code> with this email for synchronous bypass.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-white text-destructive rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return null;
}