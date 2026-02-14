"use client";

import Image from "next/image";
import { useTheme } from "./ThemeProvider";

interface ThemeLogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function ThemeLogo({
  width = 180,
  height = 56,
  className = "h-12 w-auto group-hover:scale-105 transition-transform duration-300",
  priority = false,
}: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === "dark" ? "/logo-dark.png" : "/logo.png";

  return (
    <Image
      src={src}
      alt="Oluto"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
