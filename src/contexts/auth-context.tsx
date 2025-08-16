
// src/contexts/auth-context.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Replace Firebase User type with a simple interface for our mock user
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth state on initial load
    setTimeout(() => {
      // Check for a "session" from a previous login
      if (typeof window !== 'undefined') {
        const sessionEmail = sessionStorage.getItem('mockUserEmail');
        if (sessionEmail) {
          setCurrentUser({
            uid: 'mock-user-123',
            email: sessionEmail,
            displayName: sessionEmail.split('@')[0],
            photoURL: null
          });
          router.replace('/diagram');
        }
      }
      setIsLoading(false);
    }, 500);
  }, [router]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'test@example.com' && pass === 'password123') {
          const user: User = {
            uid: 'mock-user-123',
            email: email,
            displayName: email.split('@')[0],
            photoURL: null,
          };
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('mockUserEmail', email); // Persist session
          }
          setCurrentUser(user);
          setIsLoading(false);
          router.replace('/diagram');
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error('Invalid email or password.'));
        }
      }, 500); // Simulate network delay
    });
  };

  const signup = async (email: string, pass: string) => {
    // For this mock, signup immediately logs the user in.
    setIsLoading(true);
    const user: User = {
      uid: `mock-user-${Date.now()}`,
      email: email,
      displayName: email.split('@')[0],
      photoURL: null,
    };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mockUserEmail', email); // Persist session
    }
    setCurrentUser(user);
    setIsLoading(false);
    router.replace('/diagram');
  };
  
  const logout = async () => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mockUserEmail');
    }
    setCurrentUser(null);
    setIsLoading(false);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
