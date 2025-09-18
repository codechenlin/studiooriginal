
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLanguage, type Language } from "@/context/language-context";
import { cn } from "@/lib/utils";

const languages: { code: Language; name: string }[] = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "ru", name: "Русский" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="futuristic-auth-button group/button">
          <div>
            <div className="grid-glow"></div>
            <div className="scan-line"></div>
            <Globe className="size-5 text-black dark:text-white transition-all group-hover/button:text-cyan-300 group-hover/button:drop-shadow-[0_0_5px_hsl(var(--primary))]"/>
          </div>
          <span className="sr-only">Cambiar idioma</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => setLanguage(lang.code)}
            className="flex items-center justify-between"
          >
            <span>{lang.name}</span>
            {language === lang.code && (
              <div className="w-2 h-2 rounded-full bg-[#00CE07] shadow-[0_0_8px_#00CE07]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
