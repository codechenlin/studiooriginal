
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

export function ThemeToggle() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme");
    setIsDarkMode(storedTheme === "dark");
  }, []);

  React.useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", isDarkMode);
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode, mounted]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    toast({
      title: newMode ? t('theme_dark_toast') : t('theme_light_toast'),
    });
  };

  if (!mounted) {
    return null;
  }

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
