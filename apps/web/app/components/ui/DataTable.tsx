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

export interface MobileCardHelpers<T> {
  isSelected: boolean;
  toggleSelection: () => void;
  actions?: DataTableAction<T>[];
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
  renderMobileCard?: (item: T, helpers: MobileCardHelpers<T>) => ReactNode;
}

// ============================================================================
// SORT ICON COMPONENT
// ============================================================================

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (!direction) {
    return (
      <svg
        className="h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
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
      className="h-3.5 w-3.5 text-[var(--color-brand-primary)]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg
      className="h-3.5 w-3.5 text-[var(--color-brand-primary)]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
  renderMobileCard,
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
  const setSearchQuery = useCallback(
    (query: string) => {
      if (!isControlled) {
        setInternalSearchQuery(query);
      }
      onSearch?.(query);
    },
    [isControlled, onSearch]
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumns.filter((c) => !c.hidden).map((c) => c.key))
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [sortAnnouncement, setSortAnnouncement] = useState("");

  // Filter columns
  const columns = useMemo(
    () => initialColumns.filter((c) => !enableColumnVisibility || visibleColumns.has(c.key)),
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

      // Announce sort change to screen readers
      const columnName = initialColumns.find((c) => c.key === field)?.header || field;
      const direction = newSort.direction === "asc" ? "ascending" : "descending";
      setSortAnnouncement(`${columnName} sorted ${direction}`);
    },
    [sort, onSort, initialColumns]
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
  }, [defaultSort, onFilter, onSearch, onSort, pageSize, setSearchQuery]);

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
            value !== null && value !== undefined && String(value).toLowerCase().includes(query)
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
  const activeFilterCount = Object.keys(filters).length + (searchQuery ? 1 : 0);

  // Loading skeleton
  if (loading) {
    return (
      <div
        className="bg-surface border-edge-subtle overflow-hidden rounded-2xl border shadow-sm"
        role="status"
        aria-label="Loading data"
      >
        <span className="sr-only">Loading...</span>
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="bg-surface-secondary border-edge hidden gap-4 border-b px-6 py-4 sm:grid sm:grid-cols-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface-tertiary h-4 w-20 rounded" />
            ))}
          </div>
          {/* Row skeletons */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border-edge-subtle grid grid-cols-1 gap-4 border-b px-6 py-4 sm:grid-cols-12"
            >
              {[...Array(6)].map((_, j) => (
                <div key={j} className="bg-surface-tertiary h-4 w-full rounded" />
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
      <div className="bg-surface border-edge-subtle rounded-2xl border p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/60">
          <svg
            className="h-8 w-8 text-[var(--color-brand-primary)]"
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
        <h3 className="text-heading mb-2 text-lg font-bold">{emptyState.title}</h3>
        <p className="text-muted mb-6 text-sm">{emptyState.description}</p>
        {emptyState.action && (
          <Link
            href={emptyState.action.href}
            className="btn-primary inline-flex text-sm py-2.5 px-6"
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
      <div className="bg-surface border-edge-subtle rounded-2xl border p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/60">
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
        <h3 className="text-heading mb-2 text-lg font-bold">{noResultsState.title}</h3>
        <p className="text-muted mb-6 text-sm">{noResultsState.description}</p>
        {noResultsState.onClearFilters && (
          <button
            onClick={noResultsState.onClearFilters}
            className="btn-primary inline-flex text-sm py-2.5 px-6"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className} role="grid" aria-label="Data table">
      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {sortAnnouncement}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row">
        {/* Search */}
        {searchFields && (
          <div className="relative w-full lg:max-w-md flex-1">
            <svg
              className="text-muted pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
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
              className="text-heading bg-surface placeholder:text-muted w-full rounded-xl border-0 py-2.5 pr-10 pl-10 text-sm shadow-sm ring-1 ring-[var(--color-ring-default)] transition-all ring-inset focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-inset"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                aria-label="Clear search"
                className="text-muted hover:text-heading absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex flex-wrap items-center gap-2">
          {initialColumns
            .filter((column) => column.filterable && column.filterOptions)
            .map((column) => (
              <label key={column.key}>
                <span className="sr-only">Filter by {column.header}</span>
                <select
                  aria-label={`Filter by ${column.header}`}
                  value={filters[column.key] ?? ""}
                  onChange={(event) => handleFilter(column.key, event.target.value)}
                  className="bg-surface text-heading rounded-xl border-0 px-3 py-2 text-sm shadow-sm ring-1 ring-[var(--color-ring-default)] ring-inset focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                >
                  <option value="">All {column.header.toLowerCase()}</option>
                  {column.filterOptions?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}

          {/* Column visibility toggle */}
          {enableColumnVisibility && (
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="border-edge bg-surface text-body hover:bg-surface-hover inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="bg-surface border-edge absolute top-full right-0 z-50 mt-1 w-48 rounded-xl border py-2 shadow-lg">
                  {initialColumns.map((col) => (
                    <label
                      key={col.key}
                      className="hover:bg-surface-hover flex cursor-pointer items-center gap-2 px-4 py-2"
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
                        className="rounded border-edge text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                      />
                      <span className="text-body text-sm">{col.header}</span>
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
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="mb-4 flex items-center justify-between rounded-xl border border-edge bg-surface-secondary p-3">
          <span className="text-sm font-semibold text-heading">
            {selectedRows.size} item{selectedRows.size === 1 ? "" : "s"} selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.key}
                onClick={() => action.onClick(selectedItems)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  action.variant === "danger"
                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border border-red-200 dark:border-red-900"
                    : action.variant === "primary"
                      ? "btn-primary"
                      : "btn-secondary text-heading"
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedRows(new Set())}
              className="text-muted hover:text-heading text-sm transition-colors px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border-edge-subtle overflow-hidden rounded-2xl border shadow-sm">
        {/* Header */}
        <div className="bg-surface-secondary border-edge text-muted hidden border-b text-xs font-bold tracking-wider uppercase md:grid">
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
                  aria-label="Select all rows"
                  checked={
                    paginatedData.length > 0 &&
                    paginatedData.every((item) => selectedRows.has(keyExtractor(item)))
                  }
                  onChange={toggleAllSelection}
                  className="rounded border-edge text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                />
              </div>
            )}
            {columns.map((column) => {
              const isSorted = sort?.field === column.key;
              const sortDirection = isSorted ? sort.direction : null;
              const ariaSort = column.sortable
                ? sortDirection === "asc"
                  ? "ascending"
                  : sortDirection === "desc"
                    ? "descending"
                    : "none"
                : undefined;

              return (
                <div
                  key={column.key}
                  role="columnheader"
                  aria-sort={ariaSort}
                  className={`flex items-center gap-1 ${
                    column.sortable ? "group cursor-pointer" : ""
                  } ${column.align === "right" ? "justify-end" : ""}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                  tabIndex={column.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                >
                  {column.header}
                  {column.sortable && (
                    <SortIcon direction={sort?.field === column.key ? sort.direction : null} />
                  )}
                </div>
              );
            })}
            {actions && (
              <div className="text-right" role="columnheader">
                Actions
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div role="rowgroup" className="divide-edge-subtle divide-y">
          {paginatedData.map((item, index) => {
            const id = keyExtractor(item);
            const isSelected = selectedRows.has(id);
            const isHighlighted = highlightedRows?.has(id);

            return (
              <div
                key={id}
                role="row"
                aria-selected={isSelected}
                className={`transition-all duration-200 ${
                  renderMobileCard
                    ? ""
                    : "block md:grid items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 md:gap-4"
                } ${
                  onRowClick
                    ? "cursor-pointer hover:bg-surface-secondary"
                    : "hover:bg-surface-secondary"
                } ${isSelected ? "bg-teal-50/50 dark:bg-teal-950/30" : ""} ${isHighlighted ? "ring-1 ring-[var(--color-brand-primary)] ring-inset" : ""} ${rowClassName?.(item) || ""}`}
                style={
                  renderMobileCard
                    ? undefined
                    : {
                        gridTemplateColumns: `
                          ${enableRowSelection ? "40px " : ""}
                          ${columns.map((c) => c.width || "1fr").join(" ")}
                          ${actions ? " auto" : ""}
                        `,
                      }
                }
                onClick={() => onRowClick?.(item)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(item);
                  }
                  if (onRowClick && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                    e.preventDefault();
                    const rows = Array.from(
                      e.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
                        '[role="row"]'
                      ) ?? []
                    );
                    const offset = e.key === "ArrowDown" ? 1 : -1;
                    rows[index + offset]?.focus();
                  }
                }}
              >
                {renderMobileCard ? (
                  <>
                    <div className="block md:hidden p-3.5">
                      {renderMobileCard(item, {
                        isSelected,
                        toggleSelection: () => toggleRowSelection(id),
                        actions,
                      })}
                    </div>
                    <div
                      className="hidden md:grid items-center gap-4 px-6 py-4 w-full"
                      style={{
                        gridTemplateColumns: `
                          ${enableRowSelection ? "40px " : ""}
                          ${columns.map((c) => c.width || "1fr").join(" ")}
                          ${actions ? " auto" : ""}
                        `,
                      }}
                    >
                      {enableRowSelection && (
                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label={`Select ${String((item as Record<string, unknown>)[columns[0]?.key] ?? id)}`}
                            checked={isSelected}
                            onChange={() => toggleRowSelection(id)}
                            className="rounded border-edge text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                          />
                        </div>
                      )}
                      {columns.map((column) => (
                        <div
                          key={column.key}
                          role="gridcell"
                          className={`${column.align === "right" ? "text-right" : ""} ${column.align === "center" ? "text-center" : ""}`}
                        >
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
                                className="rounded-lg p-2 transition-all duration-200 text-caption hover:bg-surface-hover hover:text-heading min-w-[36px] min-h-[36px] flex items-center justify-center"
                                title={action.label}
                                aria-label={action.label}
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

                            return <span key={action.key}>{buttonContent}</span>;
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {enableRowSelection && (
                      <div className="flex items-center py-1 md:py-0" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${String((item as Record<string, unknown>)[columns[0]?.key] ?? id)}`}
                          checked={isSelected}
                          onChange={() => toggleRowSelection(id)}
                          className="rounded border-edge text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                        />
                      </div>
                    )}
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        role="gridcell"
                        className={`py-1 md:py-0 ${column.align === "right" ? "md:text-right" : ""} ${column.align === "center" ? "md:text-center" : ""}`}
                      >
                        {/* Mobile label */}
                        <span className="text-muted mr-2 text-xs font-medium uppercase md:hidden">
                          {column.header}:
                        </span>
                        {column.render(item)}
                      </div>
                    ))}
                    {actions && (
                      <div
                        className="flex items-center justify-end gap-1 py-1 md:py-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actions.map((action) => {
                          if (action.show && !action.show(item)) return null;

                          const buttonContent = (
                            <button
                              className="rounded-lg p-2 transition-all duration-200 text-caption hover:bg-surface-hover hover:text-heading min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title={action.label}
                              aria-label={action.label}
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

                          return <span key={action.key}>{buttonContent}</span>;
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {processedData.length > 0 && (
        <div className="border-edge-subtle flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-muted text-sm">
              {`Showing ${(pagination.page - 1) * pagination.pageSize + 1} to ${Math.min(
                pagination.page * pagination.pageSize,
                processedData.length
              )} of ${processedData.length} results`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <select
              aria-label="Rows per page"
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination({
                  page: 1,
                  pageSize: Number(e.target.value),
                })
              }
              className="text-heading bg-surface rounded-lg border-0 px-2 py-1.5 text-sm shadow-sm ring-1 ring-[var(--color-ring-default)] ring-inset focus:ring-2 focus:ring-[var(--color-brand-primary)]"
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
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page === 1}
                className="text-caption hover:text-heading hover:bg-surface-hover rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    onClick={() => setPagination((p) => ({ ...p, page: pageNum }))}
                    className={`h-8 min-w-[32px] rounded-lg px-2 text-sm font-medium transition-colors ${
                      pagination.page === pageNum
                        ? "bg-[var(--color-brand-primary)] text-white"
                        : "text-caption hover:text-heading hover:bg-surface-hover"
                    } `}
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
                className="text-caption hover:text-heading hover:bg-surface-hover rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
