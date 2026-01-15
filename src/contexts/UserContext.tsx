'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { MockUser } from '@/lib/types';

// Mock user data from a local source
const MOCK_USERS: Record<string, MockUser> = {
  u1: { uid: 'u1', displayName: 'Ankit Sharma', email: 'ankit.sharma@example.com', role: 'user' },
  admin1: { uid: 'admin1', displayName: 'Admin', email: 'admin@example.com', role: 'admin' },
};


interface UserContextType {
  user: MockUser | null;
  isLoading: boolean;
  login: (userId: string) => void;
  adminLogin: (adminId: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user in localStorage
    try {
        const storedUser = localStorage.getItem('mockUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (e) {
        console.error("Could not parse user from localStorage", e);
        localStorage.removeItem('mockUser');
    }
    setIsLoading(false);
  }, []);

  const login = (userId: string) => {
    const userToLogin = MOCK_USERS[userId];
    if (userToLogin) {
      setUser(userToLogin);
      localStorage.setItem('mockUser', JSON.stringify(userToLogin));
    }
  };
  
  const adminLogin = (adminId: string) => {
    const adminToLogin = MOCK_USERS[adminId];
    if (adminToLogin && adminToLogin.role === 'admin') {
      setUser(adminToLogin);
      localStorage.setItem('mockUser', JSON.stringify(adminToLogin));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, adminLogin, logout }}>
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
