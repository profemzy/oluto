"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
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

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
