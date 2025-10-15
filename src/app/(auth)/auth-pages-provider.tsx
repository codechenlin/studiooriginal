
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import AuthLayoutClient from './auth-layout-client';

interface BackgroundImageConfig {
  light: string;
  dark: string;
}

interface AuthPagesContextType {
  loginImages: BackgroundImageConfig;
  forgotPasswordImages: BackgroundImageConfig;
}

const AuthPagesContext = createContext<AuthPagesContextType | undefined>(undefined);

export function AuthPagesProvider({
  children,
  loginImages,
  forgotPasswordImages,
}: {
  children: ReactNode;
  loginImages: BackgroundImageConfig;
  forgotPasswordImages: BackgroundImageConfig;
}) {
  const value = {
    loginImages,
    forgotPasswordImages,
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
