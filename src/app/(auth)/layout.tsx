
import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import { LanguageProvider } from '@/context/language-context';
import { AuthPagesProvider } from './auth-pages-provider';
import { LogoProvider } from '@/context/logo-context';

interface BackgroundImageConfig {
  light: string;
  dark: string;
}

interface AppConfig {
  loginBackgroundImage: BackgroundImageConfig;
  signupBackgroundImage: BackgroundImageConfig;
  forgotPasswordBackgroundImage: BackgroundImageConfig;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  [key: string]: any; 
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
      loginBackgroundImage: { light: '', dark: '' },
      signupBackgroundImage: { light: '', dark: '' },
      forgotPasswordBackgroundImage: { light: '', dark: '' },
      logoLightUrl: null,
      logoDarkUrl: null,
    };
  }
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const config = await getAuthConfig();

  return (
    <LanguageProvider>
      <LogoProvider logoLightUrl={config.logoLightUrl} logoDarkUrl={config.logoDarkUrl}>
        <AuthPagesProvider
          loginImages={config.loginBackgroundImage}
          signupImages={config.signupBackgroundImage}
          forgotPasswordImages={config.forgotPasswordBackgroundImage}
        >
          {children}
        </AuthPagesProvider>
      </LogoProvider>
    </LanguageProvider>
  );
}
