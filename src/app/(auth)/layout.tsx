import React from "react";
import fs from "fs/promises";
import path from "path";
import { AuthProviders } from "./AuthProviders";

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

async function getAuthConfig() {
  const configPath = path.join(process.cwd(), "src", "app", "lib", "app-config.json");
  try {
    const fileContent = await fs.readFile(configPath, "utf-8");
    return JSON.parse(fileContent) as AppConfig;
  } catch (error) {
    console.error("Failed to read app-config.json:", error);
    return {
      loginBackgroundImage: { light: "", dark: "" },
      forgotPasswordBackgroundImage: { light: "", dark: "" },
      logoLightUrl: null,
      logoDarkUrl: null,
    };
  }
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const config = await getAuthConfig();
  return <AuthProviders config={config}>{children}</AuthProviders>;
}
