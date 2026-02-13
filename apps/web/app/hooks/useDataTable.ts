"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface UseDataTableOptions<T> {
  queryKey: string[];
  queryFn: (params?: Record<string, string>) => Promise<T[]>;
  filterParam?: string;
  defaultFilter?: string;
  enabled?: boolean;
  /** Set to true if the queryFn ignores the filter and filtering is done client-side */
  clientSideFilter?: boolean;
}

interface UseDataTableReturn<T> {
  data: T[];
  loading: boolean;
  error: string;
  filter: string;
  setFilter: (filter: string) => void;
  refetch: () => void;
}

export function useDataTable<T>({
  queryKey,
  queryFn,
  filterParam = "status",
  defaultFilter = "",
  enabled = true,
  clientSideFilter = false,
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const [filter, setFilter] = useState(defaultFilter);

  const params: Record<string, string> = {};
  if (filter) {
    params[filterParam] = filter;
  }

  // When filtering is client-side, don't include filter in query key
  // to avoid unnecessary refetches when the filter changes
  const effectiveQueryKey = clientSideFilter
    ? queryKey
    : [...queryKey, filter];

  const {
    data = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: effectiveQueryKey,
    queryFn: () =>
      clientSideFilter
        ? queryFn()
        : queryFn(Object.keys(params).length > 0 ? params : undefined),
    enabled,
  });

  return {
    data,
    loading,
    error: error instanceof Error ? error.message : "",
    filter,
    setFilter,
    refetch,
  };
}
