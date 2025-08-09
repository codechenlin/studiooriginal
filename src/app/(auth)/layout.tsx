
"use client";

import React from "react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ThemeToggle() {
  const { toast } = useToast();
  // Initialize state from localStorage or default to dark mode
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return true; // Default to dark mode on server
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    toast({
      title: `Cambiado a modo ${newMode ? "oscuro" : "claro"}`,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="group/button rounded-full size-10 bg-card/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-black/5 dark:border-white/10 text-black dark:text-white hover:bg-gradient-to-r from-primary to-accent/80 dark:hover:bg-gradient-to-r dark:from-primary dark:to-accent/80"
    >
      {isDarkMode ? (
        <Sun className="size-5 text-white" />
      ) : (
        <Moon className="size-5 text-black group-hover/button:text-white" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "url(/bg-pattern.svg)",
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-0" />
      
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
