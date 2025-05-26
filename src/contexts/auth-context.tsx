// src/contexts/auth-context.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';

interface User {
  id: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (id: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user (e.g., from localStorage)
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('figmaticUserId') : null;
    if (storedUserId) {
      setCurrentUser({ id: storedUserId });
    }
    setIsLoading(false);
  }, []);

  const login = (id: string) => {
    const user = { id };
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('figmaticUserId', id);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('figmaticUserId');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
