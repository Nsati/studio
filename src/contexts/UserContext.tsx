'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { MockUser } from '@/lib/types';
import { MOCK_USERS, MOCK_ADMIN_PASSWORD, findUserByEmail, addUser } from '@/lib/data';
import { useRouter } from 'next/navigation';

interface UserContextType {
  user: MockUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => MockUser | null;
  signup: (name: string, email: string, pass: string) => MockUser | null;
  adminLogin: (pass: string) => boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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

  const handleAuthSuccess = (userToLogin: MockUser) => {
    setUser(userToLogin);
    localStorage.setItem('mockUser', JSON.stringify(userToLogin));
  }

  const login = (email: string, pass: string): MockUser | null => {
    const userToLogin = findUserByEmail(email);
    if (userToLogin && userToLogin.password === pass) {
      handleAuthSuccess(userToLogin);
      return userToLogin;
    }
    return null;
  };

  const signup = (name: string, email: string, pass: string): MockUser | null => {
    const existingUser = findUserByEmail(email);
    if (existingUser) {
        return null; // User already exists
    }
    const newUser = addUser(name, email, pass);
    handleAuthSuccess(newUser);
    return newUser;
  }
  
  const adminLogin = (pass: string): boolean => {
    if (pass === MOCK_ADMIN_PASSWORD) {
        const adminUser = MOCK_USERS.find(u => u.role === 'admin');
        if (adminUser) {
            handleAuthSuccess(adminUser);
            return true;
        }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    router.push('/');
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, signup, adminLogin, logout }}>
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
