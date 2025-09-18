
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
    <button onClick={toggleTheme} className="futuristic-auth-button group/button">
        <div>
            <div className="grid-glow"></div>
            <div className="scan-line"></div>
            {isDarkMode ? (
                <Sun className="size-5 text-white transition-all group-hover/button:text-yellow-300 group-hover/button:drop-shadow-[0_0_5px_#facc15]"/>
            ) : (
                <Moon className="size-5 text-black group-hover/button:text-white transition-all group-hover/button:text-purple-300 group-hover/button:drop-shadow-[0_0_5px_#c084fc]"/>
            )}
        </div>
        <span className="sr-only">Cambiar tema</span>
    </button>
  );
}
