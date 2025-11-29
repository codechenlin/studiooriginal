"use client";

import { LanguageProvider } from "@/context/language-context";
import { LogoProvider } from "@/context/logo-context";
import { AuthPagesProvider } from "./auth-pages-provider";

interface BackgroundImageConfig {
  light: string;
  dark: string;
}

interface AppConfig {
  loginBackgroundImage: BackgroundImageConfig;
  forgotPasswordBackgroundImage: BackgroundImageConfig;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
}

export function AuthProviders({
  children,
  config,
}: {
  children: React.ReactNode;
  config: AppConfig;
}) {
  return (
    <LanguageProvider>
      <LogoProvider
        logoLightUrl={config.logoLightUrl}
        logoDarkUrl={config.logoDarkUrl}
      >
        <AuthPagesProvider
          loginImages={config.loginBackgroundImage}
          forgotPasswordImages={config.forgotPasswordBackgroundImage}
        >
          {children}
        </AuthPagesProvider>
      </LogoProvider>
    </LanguageProvider>
  );
}
