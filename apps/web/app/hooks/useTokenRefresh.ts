"use client";

import { useEffect, useCallback, useRef } from "react";
import { api } from "@/app/lib/api";

/**
 * Token refresh threshold in milliseconds
 * Default: 5 minutes before expiry
 */
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Check interval in milliseconds
 * Default: Check every 60 seconds
 */
const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Hook to automatically refresh JWT tokens before they expire.
 * 
 * This hook runs a periodic check (every 60 seconds by default) to see if the
 * current token is about to expire (within 5 minutes by default). If so, it
 * attempts to refresh the token using the refresh token.
 * 
 * If the refresh fails, the user is redirected to the login page.
 * 
 * @param enabled - Whether to enable automatic token refresh (default: true)
 * @param checkInterval - How often to check token expiry (default: 60s)
 * @param refreshThreshold - How long before expiry to refresh (default: 5min)
 * 
 * @example
 * ```tsx
 * function MyApp() {
 *   useTokenRefresh(); // Enable automatic token refresh
 *   return <App />;
 * }
 * ```
 */
export function useTokenRefresh(
  enabled: boolean = true,
  checkInterval: number = CHECK_INTERVAL_MS,
  refreshThreshold: number = REFRESH_THRESHOLD_MS
): void {
  const isRefreshing = useRef(false);

  const checkAndRefresh = useCallback(async () => {
    // Skip on server-side
    if (typeof window === 'undefined') {
      return;
    }
    
    // Skip if not enabled or no token
    if (!enabled || !api.isAuthenticated()) {
      return;
    }

    // Skip if already refreshing
    if (isRefreshing.current) {
      return;
    }

    // Check if token needs refresh
    if (!api.shouldRefreshToken(refreshThreshold)) {
      return;
    }

    try {
      isRefreshing.current = true;
      await api.refreshToken();
    } catch (error) {
      // Refresh failed - redirect to login
      console.error("Token refresh failed:", error);
      api.removeToken();
      api.removeRefreshToken();
      if (typeof window !== 'undefined') {
        window.location.href = "/auth/login?reason=session_expired";
      }
    } finally {
      isRefreshing.current = false;
    }
  }, [enabled, refreshThreshold]);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    if (!enabled) return;

    // Check immediately on mount (if authenticated)
    checkAndRefresh();

    // Set up interval
    const interval = setInterval(checkAndRefresh, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, checkInterval, checkAndRefresh]);
}

/**
 * Hook to get token expiration information
 * 
 * @returns Object with expiry timestamp and formatted time remaining
 * 
 * @example
 * ```tsx
 * function TokenStatus() {
 *   const { expiry, timeRemaining } = useTokenExpiry();
 *   return <div>Token expires in: {timeRemaining}</div>;
 * }
 * ```
 */
export function useTokenExpiry(): {
  expiry: number | null;
  timeRemaining: string | null;
} {
  const expiry = api.getTokenExpiry();

  let timeRemaining: string | null = null;

  if (expiry) {
    const diff = expiry - Date.now();
    if (diff <= 0) {
      timeRemaining = "Expired";
    } else {
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        timeRemaining = `${hours}h ${minutes % 60}m`;
      } else {
        timeRemaining = `${minutes}m`;
      }
    }
  }

  return { expiry, timeRemaining };
}
