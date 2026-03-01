"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode, useSyncExternalStore } from "react";
import { useTokenRefresh } from "@/app/hooks/useTokenRefresh";
import { defaultQueryClientConfig } from "@/app/lib/queryConfig";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryClient configuration with optimized caching strategy
 * @see lib/queryConfig.ts for detailed configuration
 */
function createQueryClient() {
  return new QueryClient(defaultQueryClientConfig);
}

/**
 * Internal component that uses the token refresh hook
 */
function TokenRefreshHandler() {
  useTokenRefresh(true);
  return null;
}

// Simple store for hydration-safe mounted state
const getServerSnapshot = () => false;
const getClientSnapshot = () => true;
const subscribe = () => () => {};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(createQueryClient);
  
  // Use useSyncExternalStore for hydration-safe mounted detection
  // This avoids the setState-in-effect pattern that causes cascading renders
  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isMounted && <TokenRefreshHandler />}
    </QueryClientProvider>
  );
}
