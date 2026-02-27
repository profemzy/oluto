"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "oluto-theme";

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

// SSR-safe mount detection
const emptySubscribe = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

// Theme store with same-tab change notification
const themeStoreListeners = new Set<() => void>();

function subscribeThemeStore(callback: () => void) {
  themeStoreListeners.add(callback);
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => {
    themeStoreListeners.delete(callback);
    window.removeEventListener("storage", handler);
  };
}

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored && ["light", "dark", "system"].includes(stored) ? stored : "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(emptySubscribe, getMountedClient, getMountedServer);
  const theme = useSyncExternalStore(subscribeThemeStore, readStoredTheme, () => "system" as Theme);

  // Derive resolvedTheme synchronously
  const resolvedTheme = mounted ? resolveTheme(theme) : "light";

  // Apply theme class to document when theme changes
  useEffect(() => {
    applyTheme(resolveTheme(theme));
  }, [theme]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(resolveTheme("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    themeStoreListeners.forEach((cb) => cb());
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
