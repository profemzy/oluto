"use client";

import { useState, useMemo, ReactNode, useCallback } from "react";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: string;
  direction: SortDirection;
}

export interface FilterState {
  [key: string]: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface DataTableColumn<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { value: string; label: string }[];
  render: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
  hidden?: boolean;
}

export interface DataTableAction<T> {
  key: string;
  icon: ReactNode;
  label: string;
  href?: (item: T) => string;
  onClick?: (item: T) => void;
  variant?: "default" | "danger" | "primary";
  show?: (item: T) => boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  actions?: DataTableAction<T>[];
  bulkActions?: {
    key: string;
    label: string;
    icon?: ReactNode;
    onClick: (items: T[]) => void;
    variant?: "default" | "danger" | "primary";
  }[];
  searchFields?: (keyof T)[];
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  onSort?: (sort: SortState) => void;
  onFilter?: (filters: FilterState) => void;
  defaultSort?: SortState;
  loading?: boolean;
  emptyState?: {
    title: string;
    description: string;
    action?: {
      label: string;
      href: string;
    };
  };
  noResultsState?: {
    title: string;
    description: string;
    onClearFilters?: () => void;
  };
  className?: string;
  rowClassName?: (item: T) => string;
  pageSize?: number;
  pageSizeOptions?: number[];
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  onRowClick?: (item: T) => void;
  highlightedRows?: Set<string>;
}

// ============================================================================
// SORT ICON COMPONENT
// ============================================================================

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (!direction) {
    return (
      <svg
        className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }
  return direction === "asc" ? (
    <svg
      className="w-3.5 h-3.5 text-cyan-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  ) : (
    <svg
      className="w-3.5 h-3.5 text-cyan-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
    );
}

// ============================================================================
// MAIN DATA TABLE COMPONENT
// ============================================================================

export function DataTable<T>({
  columns: initialColumns,
  data,
  keyExtractor,
  actions,
  bulkActions,
  searchFields,
  searchPlaceholder = "Search...",
  searchQuery: controlledSearchQuery,
  onSearch,
  onSort,
  onFilter,
  defaultSort,
  loading = false,
  emptyState,
  noResultsState,
  className = "",
  rowClassName,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  enableRowSelection = false,
  enableColumnVisibility = false,
  onRowClick,
  highlightedRows,
}: DataTableProps<T>) {
  // State
  const [sort, setSort] = useState<SortState | null>(defaultSort || null);
  const [filters, setFilters] = useState<FilterState>({});
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize,
  });
  
  // Use controlled search if provided, otherwise use internal state
  const isControlled = controlledSearchQuery !== undefined;
  const searchQuery = isControlled ? controlledSearchQuery : internalSearchQuery;
  const setSearchQuery = useCallback((query: string) => {
    if (!isControlled) {
      setInternalSearchQuery(query);
    }
    onSearch?.(query);
  }, [isControlled, onSearch]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumns.filter((c) => !c.hidden).map((c) => c.key))
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Filter columns
  const columns = useMemo(
    () =>
      initialColumns.filter(
        (c) => !enableColumnVisibility || visibleColumns.has(c.key)
      ),
    [initialColumns, visibleColumns, enableColumnVisibility]
  );

  // Handle sort
  const handleSort = useCallback(
    (field: string) => {
      const newSort: SortState =
        sort?.field === field
          ? { field, direction: sort.direction === "asc" ? "desc" : "asc" }
          : { field, direction: "asc" };
      setSort(newSort);
      setPagination((p) => ({ ...p, page: 1 }));
      onSort?.(newSort);
    },
    [sort, onSort]
  );

  // Handle filter
  const handleFilter = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...filters, [key]: value };
      if (!value) delete newFilters[key];
      setFilters(newFilters);
      setPagination((p) => ({ ...p, page: 1 }));
      onFilter?.(newFilters);
    },
    [filters, onFilter]
  );

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setPagination((p) => ({ ...p, page: 1 }));
    },
    [setSearchQuery]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setSort(defaultSort || null);
    setPagination({ page: 1, pageSize });
    onFilter?.({});
    onSearch?.("");
    if (defaultSort) onSort?.(defaultSort);
  }, [defaultSort, onFilter, onSearch, onSort, pageSize]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery && searchFields) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return (
            value !== null &&
            value !== undefined &&
            String(value).toLowerCase().includes(query)
          );
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => {
          const itemValue = (item as Record<string, unknown>)[key];
          return String(itemValue) === value;
        });
      }
    });

    // Apply sort
    if (sort) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sort.field];
        const bVal = (b as Record<string, unknown>)[sort.field];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison =
          typeof aVal === "number" && typeof bVal === "number"
            ? aVal - bVal
            : String(aVal).localeCompare(String(bVal));

        return sort.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, searchFields, filters, sort]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pagination.pageSize);
  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return processedData.slice(start, start + pagination.pageSize);
  }, [processedData, pagination]);

  // Row selection
  const toggleRowSelection = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllSelection = useCallback(() => {
    const currentPageIds = paginatedData.map(keyExtractor);
    const allSelected = currentPageIds.every((id) => selectedRows.has(id));

    setSelectedRows((prev) => {
      const next = new Set(prev);
      currentPageIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  }, [paginatedData, keyExtractor, selectedRows]);

  const selectedItems = useMemo(
    () => data.filter((item) => selectedRows.has(keyExtractor(item))),
    [data, selectedRows, keyExtractor]
  );

  // Active filter count
  const activeFilterCount =
    Object.keys(filters).length + (searchQuery ? 1 : 0);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-surface-secondary border-b border-edge">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-surface-tertiary rounded w-20" />
            ))}
          </div>
          {/* Row skeletons */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 border-b border-edge-subtle"
            >
              {[...Array(6)].map((_, j) => (
                <div
                  key={j}
                  className="h-4 bg-surface-tertiary rounded w-full"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-cyan-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-heading mb-2">
          {emptyState.title}
        </h3>
        <p className="text-sm text-muted mb-6">{emptyState.description}</p>
        {emptyState.action && (
          <Link
            href={emptyState.action.href}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            {emptyState.action.label}
          </Link>
        )}
      </div>
    );
  }

  // No results state
  if (processedData.length === 0 && noResultsState) {
    return (
      <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-heading mb-2">
          {noResultsState.title}
        </h3>
        <p className="text-sm text-muted mb-6">
          {noResultsState.description}
        </p>
        {noResultsState.onClearFilters && (
          <button
            onClick={noResultsState.onClearFilters}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col lg:flex-row gap-4">
        {/* Search */}
        {searchFields && (
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-xl border-0 py-2.5 pl-10 pr-10 text-sm text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 bg-surface placeholder:text-muted transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted hover:text-heading transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Column visibility toggle */}
          {enableColumnVisibility && (
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-3 py-2 text-sm font-medium text-body hover:bg-surface-hover transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                Columns
              </button>
              {showColumnMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-surface border border-edge shadow-lg py-2 z-50">
                  {initialColumns.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-surface-hover cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col.key)}
                        onChange={(e) => {
                          const next = new Set(visibleColumns);
                          if (e.target.checked) next.add(col.key);
                          else next.delete(col.key);
                          setVisibleColumns(next);
                        }}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-body">{col.header}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear {activeFilterCount} filter
              {activeFilterCount === 1 ? "" : "s"}
            </button>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      {enableRowSelection && selectedRows.size > 0 && bulkActions && (
        <div className="mb-4 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 flex items-center justify-between">
          <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
            {selectedRows.size} item{selectedRows.size === 1 ? "" : "s"} selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.key}
                onClick={() => action.onClick(selectedItems)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  action.variant === "danger"
                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    : action.variant === "primary"
                    ? "text-white bg-cyan-600 hover:bg-cyan-700"
                    : "text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900"
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedRows(new Set())}
              className="text-sm text-muted hover:text-heading transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
          <div
            className="grid gap-4 px-6 py-4"
            style={{
              gridTemplateColumns: `
                ${enableRowSelection ? "40px " : ""}
                ${columns.map((c) => c.width || "1fr").join(" ")}
                ${actions ? " auto" : ""}
              `,
            }}
          >
            {enableRowSelection && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    paginatedData.every((item) =>
                      selectedRows.has(keyExtractor(item))
                    )
                  }
                  onChange={toggleAllSelection}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
              </div>
            )}
            {columns.map((column) => (
              <div
                key={column.key}
                className={`flex items-center gap-1 ${
                  column.sortable ? "cursor-pointer group" : ""
                } ${column.align === "right" ? "justify-end" : ""}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                {column.header}
                {column.sortable && (
                  <SortIcon
                    direction={
                      sort?.field === column.key ? sort.direction : null
                    }
                  />
                )}
              </div>
            ))}
            {actions && <div className="text-right">Actions</div>}
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-edge-subtle">
          {paginatedData.map((item, index) => {
            const id = keyExtractor(item);
            const isSelected = selectedRows.has(id);
            const isHighlighted = highlightedRows?.has(id);

            return (
              <div
                key={id}
                className={`
                  grid gap-2 sm:gap-4 px-6 py-4 transition-all duration-200 items-center
                  ${
                    onRowClick
                      ? "cursor-pointer hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30"
                      : "hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30"
                  }
                  ${isSelected ? "bg-cyan-50/70 dark:bg-cyan-950/50" : ""}
                  ${isHighlighted ? "ring-1 ring-inset ring-cyan-500" : ""}
                  ${rowClassName?.(item) || ""}
                  sm:grid-cols-none
                `}
                style={{
                  gridTemplateColumns: `
                    ${enableRowSelection ? "40px " : ""}
                    ${columns.map((c) => c.width || "1fr").join(" ")}
                    ${actions ? " auto" : ""}
                  `,
                }}
                onClick={() => onRowClick?.(item)}
              >
                {enableRowSelection && (
                  <div
                    className="flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRowSelection(id)}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                  </div>
                )}
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`
                      ${column.align === "right" ? "text-right" : ""}
                      ${column.align === "center" ? "text-center" : ""}
                    `}
                  >
                    {/* Mobile label */}
                    <span className="sm:hidden text-xs font-medium text-muted uppercase mr-2">
                      {column.header}:
                    </span>
                    {column.render(item)}
                  </div>
                ))}
                {actions && (
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {actions.map((action) => {
                      if (action.show && !action.show(item)) return null;

                      const buttonContent = (
                        <button
                          className={`
                            p-2 rounded-lg transition-all duration-200
                            ${
                              action.variant === "danger"
                                ? "text-caption hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                : action.variant === "primary"
                                ? "text-caption hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                                : "text-caption hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                            }
                          `}
                          title={action.label}
                          onClick={() => action.onClick?.(item)}
                        >
                          {action.icon}
                        </button>
                      );

                      if (action.href) {
                        return (
                          <Link key={action.key} href={action.href(item)}>
                            {buttonContent}
                          </Link>
                        );
                      }

                      return (
                        <span key={action.key}>{buttonContent}</span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">
              Showing{" "}
              <span className="font-medium text-heading">
                {(pagination.page - 1) * pagination.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-heading">
                {Math.min(
                  pagination.page * pagination.pageSize,
                  processedData.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-heading">
                {processedData.length}
              </span>{" "}
              results
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <select
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination({
                  page: 1,
                  pageSize: Number(e.target.value),
                })
              }
              className="rounded-lg border-0 py-1.5 px-2 text-sm text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 bg-surface"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
                }
                disabled={pagination.page === 1}
                className="p-2 rounded-lg text-caption hover:text-heading hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: pageNum }))
                    }
                    className={`
                      min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        pagination.page === pageNum
                          ? "bg-cyan-600 text-white"
                          : "text-caption hover:text-heading hover:bg-surface-hover"
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    page: Math.min(totalPages, p.page + 1),
                  }))
                }
                disabled={pagination.page === totalPages}
                className="p-2 rounded-lg text-caption hover:text-heading hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
