"use client";

import { useTheme } from "./ThemeProvider";

interface ThemeLogoProps {
  className?: string;
}

export function ThemeLogo({
  className = "h-10 w-auto group-hover:scale-105 transition-transform duration-300",
}: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark — stylized "O" with directional energy */}
      <div className="relative flex-shrink-0">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="oluto-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          {/* Rounded square with gradient */}
          <rect x="2" y="2" width="32" height="32" rx="9" fill="url(#oluto-grad)" />
          {/* Arrow pointing up-right — represents "directing wealth" */}
          <path
            d="M12 24L24 12M24 12H16M24 12V20"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
        >
          Oluto
        </span>
        <span
          className="text-[10px] font-medium tracking-wider mt-0.5"
          style={{ color: isDark ? "#64748b" : "#94a3b8" }}
        >
          Direct Your Wealth.
        </span>
      </div>
    </div>
  );
}
