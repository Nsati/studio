'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

interface UserState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Hook for subscribing to the current user's authentication state.
 *
 * This hook provides a real-time snapshot of the user's login status,
 * including the user object if authenticated, a loading state, and any
 * potential errors during the authentication process. It is designed to
 * be used within a `FirebaseProvider` context.
 *
 * @returns {UserState} An object containing:
 *  - `user`: The Firebase `User` object if logged in, otherwise `null`.
 *  - `isUserLoading`: A boolean that is `true` while the auth state is being determined, and `false` otherwise.
 *  - `userError`: An `Error` object if there was an issue with authentication, otherwise `null`.
 *
 * @example
 * const { user, isUserLoading, userError } = useUser();
 *
 * if (isUserLoading) {
 *   return <p>Loading...</p>;
 * }
 *
 * if (userError) {
 *   return <p>Error: {userError.message}</p>;
 * }
 *
 * if (user) {
 *   return <p>Welcome, {user.displayName}!</p>;
 * } else {
 *   return <p>Please sign in.</p>;
 * }
 */
export function useUser(): UserState {
  const auth = useAuth();
  const [userState, setUserState] = useState<UserState>({
    user: auth?.currentUser ?? null,
    isUserLoading: !auth?.currentUser,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({
        user: null,
        isUserLoading: false,
        userError: new Error('Firebase Auth is not initialized.'),
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUserState({ user, isUserLoading: false, userError: null });
      },
      (error) => {
        setUserState({ user: null, isUserLoading: false, userError: error });
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return userState;
}
