"use client";

import { useTheme } from "./ThemeProvider";

interface ThemeLogoProps {
  className?: string;
}

export function ThemeLogo({
  className = "h-12 w-auto group-hover:scale-105 transition-transform duration-300",
}: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const taglineColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <svg
      viewBox="0 0 260 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Oluto - Direct Your Wealth"
    >
      <defs>
        <linearGradient id="logo-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="logo-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="logo-arrow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>

      {/* Compass circle */}
      <circle cx="32" cy="36" r="28" fill="url(#logo-fill)" opacity="0.9" />

      {/* Ring arc — upper-left open */}
      <path
        d="M32 8 A28 28 0 1 1 8 24"
        stroke="url(#logo-ring)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Arrow / compass needle pointing upper-right */}
      <path
        d="M32 36 L18 50 L32 12 L46 50 Z"
        fill="url(#logo-arrow)"
        opacity="0.95"
      />
      {/* Inner arrow highlight */}
      <path
        d="M32 18 L38 44 L32 38 L26 44 Z"
        fill="white"
        opacity="0.6"
      />

      {/* "Oluto" text */}
      <text
        x="72"
        y="42"
        fontFamily="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="36"
        fill={textColor}
        letterSpacing="-0.02em"
      >
        Oluto
      </text>

      {/* "Direct Your Wealth." tagline */}
      <text
        x="73"
        y="60"
        fontFamily="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
        fontWeight="400"
        fontSize="13"
        fill={taglineColor}
        letterSpacing="0.02em"
      >
        Direct Your Wealth.
      </text>
    </svg>
  );
}
