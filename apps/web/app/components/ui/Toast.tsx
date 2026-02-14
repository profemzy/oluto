"use client";

import { Toaster as HotToaster } from "react-hot-toast";
import { useTheme } from "../ThemeProvider";

export function Toast() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? "#1e293b" : "#fff",
          color: isDark ? "#e2e8f0" : "#1f2937",
          borderRadius: "0.75rem",
          border: isDark ? "1px solid #334155" : "none",
          boxShadow: isDark
            ? "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.2)"
            : "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: isDark ? "#1e293b" : "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: isDark ? "#1e293b" : "#fff",
          },
        },
      }}
    />
  );
}
