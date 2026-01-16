'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth, useFirestore, useDoc } from '@/firebase';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
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
