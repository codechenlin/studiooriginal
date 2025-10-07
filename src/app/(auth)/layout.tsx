
import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import { LanguageProvider } from '@/context/language-context';
import { AuthPagesProvider } from './auth-pages-provider';

interface AppConfig {
  loginBackgroundImageUrl: string;
  signupBackgroundImageUrl: string;
  forgotPasswordBackgroundImageUrl: string;
  [key: string]: string;
}

async function getAuthConfig() {
  const configPath = path.join(process.cwd(), 'src', 'app', 'lib', 'app-config.json');
  try {
    const fileContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(fileContent) as AppConfig;
  } catch (error) {
    console.error("Failed to read app-config.json:", error);
    // Return a default config to prevent build errors if the file is missing
    return {
      loginBackgroundImageUrl: '',
      signupBackgroundImageUrl: '',
      forgotPasswordBackgroundImageUrl: '',
    };
  }
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const config = await getAuthConfig();

  return (
    <LanguageProvider>
      <AuthPagesProvider
        loginImageUrl={config.loginBackgroundImageUrl}
        signupImageUrl={config.signupBackgroundImageUrl}
        forgotPasswordImageUrl={config.forgotPasswordBackgroundImageUrl}
      >
        {children}
      </AuthPagesProvider>
    </LanguageProvider>
  );
}
