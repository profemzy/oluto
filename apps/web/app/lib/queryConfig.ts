/**
 * Query Configuration - Centralized TanStack Query settings
 * 
 * This module provides sensible defaults for different data types,
 * balancing freshness with performance.
 * 
 * Data freshness strategy:
 * - Real-time data (chat): 0s staleTime, frequent polling
 * - User-facing dashboards: 10s staleTime, updates often
 * - Reference data (accounts): 5min staleTime, rarely changes
 * - Static data (reports): 1min staleTime, snapshot-based
 */

import { QueryClientConfig, UseQueryOptions } from "@tanstack/react-query";

/**
 * Default QueryClient configuration
 */
export const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Data stays fresh for 30 seconds (no refetch on mount if within this time)
      staleTime: 30 * 1000,
      // Cache persists for 5 minutes after last component unmounts
      gcTime: 5 * 60 * 1000,
      // Retry failed requests once after 1 second
      retry: 1,
      retryDelay: 1000,
      // Don't refetch on window focus (reduces API calls)
      refetchOnWindowFocus: false,
      // Don't refetch on network reconnect (user can manually refresh)
      refetchOnReconnect: false,
      // Enable suspense for better loading states (future React feature)
      // suspense: false,
    },
    mutations: {
      // Retry mutations once (useful for network hiccups)
      retry: 1,
      retryDelay: 1000,
    },
  },
};

/**
 * Query stale time presets for different data types
 */
export const staleTimePresets = {
  /** Real-time data - always fetch fresh (chat messages, notifications) */
  realTime: 0,
  
  /** User dashboard - 10 seconds for financial metrics */
  dashboard: 10 * 1000,
  
  /** Lists that update frequently - 30 seconds */
  frequent: 30 * 1000,
  
  /** Standard entity lists - 2 minutes */
  standard: 2 * 60 * 1000,
  
  /** Reference data - 5 minutes (accounts, contacts) */
  reference: 5 * 60 * 1000,
  
  /** Semi-static data - 15 minutes (tax rates, settings) */
  semiStatic: 15 * 60 * 1000,
  
  /** Static data - 1 hour (doesn't change during session) */
  static: 60 * 60 * 1000,
} as const;

/**
 * Common query options for different data patterns
 */
export const queryOptions = {
  /** Dashboard summary, AR aging, reconciliation status */
  dashboard: <TData, TError = Error>(): Partial<UseQueryOptions<TData, TError>> => ({
    staleTime: staleTimePresets.dashboard,
    gcTime: 2 * 60 * 1000, // 2 minutes
  }),

  /** Transaction lists, invoices, bills */
  entityList: <TData, TError = Error>(): Partial<UseQueryOptions<TData, TError>> => ({
    staleTime: staleTimePresets.frequent,
    gcTime: 5 * 60 * 1000, // 5 minutes
  }),

  /** Individual entity details */
  entityDetail: <TData, TError = Error>(): Partial<UseQueryOptions<TData, TError>> => ({
    staleTime: staleTimePresets.standard,
    gcTime: 3 * 60 * 1000, // 3 minutes
  }),

  /** Reference data (accounts, contacts, categories) */
  reference: <TData, TError = Error>(): Partial<UseQueryOptions<TData, TError>> => ({
    staleTime: staleTimePresets.reference,
    gcTime: 10 * 60 * 1000, // 10 minutes
  }),

  /** Reports and financial statements */
  report: <TData, TError = Error>(): Partial<UseQueryOptions<TData, TError>> => ({
    staleTime: staleTimePresets.standard,
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Reports can be expensive to generate, don't refetch automatically
    refetchOnMount: false,
  }),

  /** Chat conversations and messages */
  chat: <TData, TError = Error>(): Partial<UseQueryOptions<TData, TError>> => ({
    staleTime: staleTimePresets.realTime,
    gcTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    // Polling for new messages (handled separately for active conversations)
  }),

  /** Current user and session data */
  session: <TData, TError = Error>(): Partial<UseQueryOptions<TData, TError>> => ({
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  }),
};

/**
 * Query key factories for consistent cache management
 */
export const queryKeys = {
  /** Dashboard queries */
  dashboard: {
    all: ["dashboard"] as const,
    summary: (businessId: string) => [...queryKeys.dashboard.all, "summary", businessId] as const,
    overdueInvoices: (businessId: string) => [...queryKeys.dashboard.all, "overdueInvoices", businessId] as const,
    overdueBills: (businessId: string) => [...queryKeys.dashboard.all, "overdueBills", businessId] as const,
    arAging: (businessId: string, asOfDate: string) => 
      [...queryKeys.dashboard.all, "arAging", businessId, asOfDate] as const,
    reconciliation: (businessId: string) => [...queryKeys.dashboard.all, "reconciliation", businessId] as const,
  },

  /** Transaction queries */
  transactions: {
    all: ["transactions"] as const,
    list: (businessId: string, filters?: Record<string, unknown>) => 
      [...queryKeys.transactions.all, "list", businessId, filters] as const,
    detail: (id: string) => [...queryKeys.transactions.all, "detail", id] as const,
  },

  /** Invoice queries */
  invoices: {
    all: ["invoices"] as const,
    list: (businessId: string, status?: string) => 
      [...queryKeys.invoices.all, "list", businessId, status] as const,
    detail: (id: string) => [...queryKeys.invoices.all, "detail", id] as const,
  },

  /** Bill queries */
  bills: {
    all: ["bills"] as const,
    list: (businessId: string, status?: string) => 
      [...queryKeys.bills.all, "list", businessId, status] as const,
    detail: (id: string) => [...queryKeys.bills.all, "detail", id] as const,
  },

  /** Contact queries */
  contacts: {
    all: ["contacts"] as const,
    list: (businessId: string) => [...queryKeys.contacts.all, "list", businessId] as const,
    detail: (id: string) => [...queryKeys.contacts.all, "detail", id] as const,
  },

  /** Account queries */
  accounts: {
    all: ["accounts"] as const,
    list: (businessId: string) => [...queryKeys.accounts.all, "list", businessId] as const,
    detail: (id: string) => [...queryKeys.accounts.all, "detail", id] as const,
  },

  /** Chat queries */
  chat: {
    all: ["chat"] as const,
    conversations: (businessId: string) => 
      [...queryKeys.chat.all, "conversations", businessId] as const,
    messages: (conversationId: string) => 
      [...queryKeys.chat.all, "messages", conversationId] as const,
  },

  /** User session */
  user: {
    all: ["user"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
    profile: (userId: string) => [...queryKeys.user.all, "profile", userId] as const,
  },

  /** Reports */
  reports: {
    all: ["reports"] as const,
    profitLoss: (businessId: string, params?: Record<string, unknown>) => 
      [...queryKeys.reports.all, "profitLoss", businessId, params] as const,
    balanceSheet: (businessId: string, asOfDate?: string) => 
      [...queryKeys.reports.all, "balanceSheet", businessId, asOfDate] as const,
    trialBalance: (businessId: string, asOfDate?: string) => 
      [...queryKeys.reports.all, "trialBalance", businessId, asOfDate] as const,
    arAging: (businessId: string, asOfDate?: string) => 
      [...queryKeys.reports.all, "arAging", businessId, asOfDate] as const,
  },
};

/**
 * Mutation configuration helpers
 */
export const mutationConfig = {
  /** Standard entity mutations with automatic cache invalidation */
  entity: {
    /** After creating, invalidate the list query */
    onCreateSuccess: (queryClient: import("@tanstack/react-query").QueryClient, listQueryKey: unknown[]) => ({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      },
    }),

    /** After updating, invalidate both detail and list */
    onUpdateSuccess: (queryClient: import("@tanstack/react-query").QueryClient, detailQueryKey: unknown[], listQueryKey: unknown[]) => ({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: detailQueryKey });
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      },
    }),

    /** After deleting, remove from cache and invalidate list */
    onDeleteSuccess: (queryClient: import("@tanstack/react-query").QueryClient, detailQueryKey: unknown[], listQueryKey: unknown[]) => ({
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: detailQueryKey });
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      },
    }),
  },
};
