// src/contexts/auth-context.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';
import {
  Auth,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  googleLogin: () => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      if (user) {
        router.replace('/diagram');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };
  
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    // No need to push, onAuthStateChanged will handle redirect
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, googleLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
