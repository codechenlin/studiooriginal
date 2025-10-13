
"use client";

import { type SVGProps, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLogo } from "@/context/logo-context";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  const { logoLightUrl, logoDarkUrl } = useLogo();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkTheme = () => {
      // Accessing document only on client side
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Determine logoUrl based on theme
  const logoUrl = isDarkMode ? logoDarkUrl : logoLightUrl;

  if (!mounted) {
    // Render a placeholder or nothing during server-side rendering and before hydration
    return <div className={cn("h-10 w-40", className)} />;
  }

  if (logoUrl) {
    return (
      <div className={cn("relative h-10 w-40", className)}>
        <Image src={logoUrl} alt="Mailflow AI Logo" fill className="object-contain" priority />
      </div>
    );
  }

  // Fallback to SVG logo if no custom URL is set
  return (
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={cn("size-8", className)}
        {...props}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))" }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--accent))" }} />
          </linearGradient>
        </defs>
        <path
          fill="url(#logoGradient)"
          d="M3 20.25a.75.75 0 0 0 1.5 0V9.412l7.663 4.21a1.5 1.5 0 0 0 1.674 0L21 9.412v10.838a.75.75 0 0 0 1.5 0V8.25a1.5 1.5 0 0 0-1.012-1.423l-8.25-4.5a1.5 1.5 0 0 0-1.476 0l-8.25 4.5A1.5 1.5 0 0 0 3 8.25v12Z"
        />
      </svg>
      <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent">Mailflow AI</span>
    </div>
  );
}
