"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode, useEffect } from "react";
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

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(createQueryClient);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {mounted && <TokenRefreshHandler />}
    </QueryClientProvider>
  );
}
