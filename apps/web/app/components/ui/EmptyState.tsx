"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  className?: string;
  variant?: "default" | "compact" | "inline";
}

const defaultIcons: Record<string, ReactNode> = {
  default: (
    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  search: (
    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  documents: (
    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  people: (
    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  money: (
    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chart: (
    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  success: (
    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  variant = "default",
}: EmptyStateProps) {
  const variantStyles = {
    default: "p-12",
    compact: "p-8",
    inline: "p-6",
  };

  const iconContainerStyles = {
    default: "h-20 w-20 mb-6",
    compact: "h-16 w-16 mb-4",
    inline: "h-12 w-12 mb-3",
  };

  const titleStyles = {
    default: "text-xl",
    compact: "text-lg",
    inline: "text-base",
  };

  return (
    <div
      className={`
        bg-surface rounded-2xl border border-edge-subtle shadow-sm
        text-center ${variantStyles[variant]} ${className}
      `}
    >
      <div
        className={`
          mx-auto rounded-full bg-gradient-to-br from-cyan-50 to-teal-50
          dark:from-cyan-950 dark:to-teal-950
          flex items-center justify-center text-cyan-600
          ${iconContainerStyles[variant]}
        `}
      >
        {icon || defaultIcons.default}
      </div>

      <h3 className={`font-bold text-heading mb-2 ${titleStyles[variant]}`}>
        {title}
      </h3>

      <p className={`text-muted mb-6 max-w-sm mx-auto ${variant === "inline" ? "text-sm" : ""}`}>
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className={`flex items-center justify-center gap-3 ${variant === "inline" ? "flex-wrap" : ""}`}>
          {action && (
            action.onClick ? (
              <button
                onClick={action.onClick}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {action.label}
              </button>
            ) : (
              <Link
                href={action.href}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {action.label}
              </Link>
            )
          )}

          {secondaryAction && (
            secondaryAction.onClick ? (
              <button
                onClick={secondaryAction.onClick}
                className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                {secondaryAction.label}
              </button>
            ) : (
              <Link
                href={secondaryAction.href}
                className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                {secondaryAction.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NO RESULTS COMPONENT (for when search returns nothing)
// ============================================================================

interface NoResultsProps {
  searchQuery?: string;
  onClearSearch?: () => void;
  className?: string;
}

export function NoResults({ searchQuery, onClearSearch, className = "" }: NoResultsProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-4">
        <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-heading mb-1">
        No results found
      </h3>
      {searchQuery && (
        <p className="text-sm text-muted mb-4">
          No items match &quot;{searchQuery}&quot;
        </p>
      )}
      {onClearSearch && (
        <button
          onClick={onClearSearch}
          className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
        >
          Clear search
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SKELETON LOADING COMPONENT
// ============================================================================

interface SkeletonProps {
  variant?: "card" | "list" | "table" | "text" | "avatar";
  count?: number;
  className?: string;
}

export function Skeleton({ variant = "text", count = 1, className = "" }: SkeletonProps) {
  const baseClass = "animate-pulse bg-surface-tertiary rounded";

  const variants = {
    card: "h-32 w-full",
    list: "h-16 w-full",
    table: "h-12 w-full",
    text: "h-4 w-3/4",
    avatar: "h-10 w-10 rounded-full",
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${baseClass} ${variants[variant]}`} />
      ))}
    </div>
  );
}

export default EmptyState;
