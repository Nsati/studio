'use client';

import { useState, createContext, useContext, ReactNode, useMemo } from 'react';
import type { MockUser } from '@/lib/types';

interface UserContextType {
  user: MockUser | null;
  isLoading: boolean;
  login: (user: MockUser) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = (userData: MockUser) => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setUser(userData);
      setIsLoading(false);
    }, 500);
  };

  const logout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(null);
      setIsLoading(false);
    }, 500);
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
  }), [user, isLoading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
