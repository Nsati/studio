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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Auth service is not yet available. This is expected on initial render.
      // We remain in a loading state until the auth object is provided.
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  return {
    user,
    userProfile,
    isLoading: isLoading || (user && isLoadingProfile),
  };
}
