
'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface LogoContextType {
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export function LogoProvider({
  children,
  logoLightUrl,
  logoDarkUrl,
}: {
  children: ReactNode;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
}) {
  const value = {
    logoLightUrl,
    logoDarkUrl,
  };

  return (
    <LogoContext.Provider value={value}>
        {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    // Provide a fallback for when the context is not available
    // This can happen in scenarios outside the main layouts
    return { logoLightUrl: null, logoDarkUrl: null };
  }
  return context;
}
