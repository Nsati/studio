'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

import type { UserProfile } from '@/lib/types';
import { useAuth, useFirestore } from '../provider';
import { useDoc } from '../firestore/use-doc';

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  // START with isLoading: true. This is the key to preventing hydration errors.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If the auth service isn't ready, don't do anything. The `isLoading`
    // state will remain `true`, which is correct for SSR and initial client render.
    if (!auth) {
      return;
    }

    // Auth service IS ready. Set up the listener.
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      // Once we get the first response from onAuthStateChanged, we know the
      // auth state is determined. Now we can set loading to false.
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Rerun this effect if the auth object itself changes

  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  return {
    user,
    userProfile,
    // The overall loading state is true if either the auth state is loading,
    // or if we have a user but are still loading their profile.
    isLoading: isLoading || (user && isLoadingProfile),
  };
}
