import { type SVGProps } from "react";
import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
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
