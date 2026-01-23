'use client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handler = (error: any) => {
      console.error(error); // Log the error for debugging purposes.
      // The toast notification has been disabled as per the user's request
      // to remove disruptive pop-ups. The error will still appear in the
      // developer console.
      /*
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description:
          'You do not have permission to perform this action. Check Firestore rules.',
      });
      */
    };

    errorEmitter.on('permission-error', handler);

    return () => {
      errorEmitter.off('permission-error', handler);
    };
  }, [toast]);

  return null; // This component does not render anything
}
