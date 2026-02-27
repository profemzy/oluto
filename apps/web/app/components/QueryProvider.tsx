"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode, useEffect } from "react";
import { useTokenRefresh } from "@/app/hooks/useTokenRefresh";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryClient configuration with optimized caching strategy
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
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
