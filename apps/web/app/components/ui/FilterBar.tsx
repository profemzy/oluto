"use client";

import { useState, ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

interface FilterBarProps {
  filters: FilterGroup[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
  children?: ReactNode;
  className?: string;
}

// ============================================================================
// FILTER CHIP COMPONENT
// ============================================================================

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 whitespace-nowrap
        ${
          active
            ? "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500"
            : "bg-surface border border-edge text-body hover:border-cyan-500 hover:text-cyan-600"
        }
      `}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`
          text-xs px-1.5 py-0.5 rounded-full
          ${active ? "bg-cyan-200 dark:bg-cyan-800" : "bg-surface-tertiary"}
        `}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// FILTER BAR COMPONENT
// ============================================================================

export function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  children,
  className = "",
}: FilterBarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Horizontal filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((group) => (
          <div key={group.key} className="relative">
            {/* Dropdown for groups with many options */}
            {group.options.length > 5 ? (
              <div className="relative">
                <button
                  onClick={() => toggleGroup(group.key)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all duration-200
                    ${
                      activeFilters[group.key]
                        ? "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500"
                        : "bg-surface border border-edge text-body hover:border-cyan-500"
                    }
                  `}
                >
                  {group.label}
                  {activeFilters[group.key] && (
                    <span className="ml-1">
                      :
                      {
                        group.options.find(
                          (o) => o.value === activeFilters[group.key]
                        )?.label
                      }
                    </span>
                  )}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${
                      expandedGroups.has(group.key) ? "rotate-180" : ""
                    }`}
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
                </button>

                {expandedGroups.has(group.key) && (
                  <div className="absolute top-full left-0 mt-1 min-w-[160px] max-h-[240px] overflow-y-auto rounded-xl bg-surface border border-edge shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        onFilterChange(group.key, "");
                        toggleGroup(group.key);
                      }}
                      className={`
                        w-full text-left px-4 py-2 text-sm transition-colors
                        ${
                          !activeFilters[group.key]
                            ? "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300"
                            : "text-body hover:bg-surface-hover"
                        }
                      `}
                    >
                      All {group.label}
                    </button>
                    {group.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onFilterChange(group.key, option.value);
                          toggleGroup(group.key);
                        }}
                        className={`
                          w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between
                          ${
                            activeFilters[group.key] === option.value
                              ? "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300"
                              : "text-body hover:bg-surface-hover"
                          }
                        `}
                      >
                        {option.label}
                        {option.count !== undefined && (
                          <span className="text-xs text-muted">
                            {option.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Inline chips for groups with few options
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-muted uppercase mr-1">
                  {group.label}:
                </span>
                <FilterChip
                  label="All"
                  active={!activeFilters[group.key]}
                  onClick={() => onFilterChange(group.key, "")}
                />
                {group.options.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    active={activeFilters[group.key] === option.value}
                    onClick={() => onFilterChange(group.key, option.value)}
                    count={option.count}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Clear all button */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
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
            Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
          </button>
        )}

        {/* Additional controls */}
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// FILTER SELECT COMPONENT (for sidebar/filter panel)
// ============================================================================

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
}: FilterSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted uppercase">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-0 py-2 px-3 text-sm text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 bg-surface transition-all"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.count !== undefined ? ` (${option.count})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// FILTER PANEL COMPONENT (sidebar style)
// ============================================================================

interface FilterPanelProps {
  filters: FilterGroup[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterPanel({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  className = "",
}: FilterPanelProps) {
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className={`bg-surface rounded-2xl border border-edge-subtle p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-heading">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filters.map((group) => (
          <FilterSelect
            key={group.key}
            label={group.label}
            value={activeFilters[group.key] || ""}
            options={group.options}
            onChange={(value) => onFilterChange(group.key, value)}
            placeholder={`All ${group.label}`}
          />
        ))}
      </div>
    </div>
  );
}

export default FilterBar;
