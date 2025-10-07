
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import AuthLayoutClient from './auth-layout-client';

interface AuthPagesContextType {
  loginImageUrl: string;
  signupImageUrl: string;
  forgotPasswordImageUrl: string;
}

const AuthPagesContext = createContext<AuthPagesContextType | undefined>(undefined);

export function AuthPagesProvider({
  children,
  loginImageUrl,
  signupImageUrl,
  forgotPasswordImageUrl,
}: {
  children: ReactNode;
  loginImageUrl: string;
  signupImageUrl: string;
  forgotPasswordImageUrl: string;
}) {
  const value = {
    loginImageUrl,
    signupImageUrl,
    forgotPasswordImageUrl,
  };

  return (
    <AuthPagesContext.Provider value={value}>
        <AuthLayoutClient>
            {children}
        </AuthLayoutClient>
    </AuthPagesContext.Provider>
  );
}

export function useAuthPages() {
  const context = useContext(AuthPagesContext);
  if (context === undefined) {
    throw new Error('useAuthPages must be used within an AuthPagesProvider');
  }
  return context;
}
