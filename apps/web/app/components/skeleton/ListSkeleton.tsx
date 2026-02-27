"use client";

import { Skeleton, SkeletonButton } from "./Skeleton";

interface ListSkeletonProps {
  title?: string;
  actionButton?: boolean;
  rowCount?: number;
  columnCount?: number;
}

/**
 * ListSkeleton - Skeleton for list pages (transactions, contacts, invoices, bills)
 */
export function ListSkeleton({
  title = "Items",
  actionButton = true,
  rowCount = 8,
  columnCount = 4,
}: ListSkeletonProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Page Header Skeleton */}
      <div className="bg-surface/90 backdrop-blur-sm border-b border-edge/80 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            {actionButton && <SkeletonButton />}
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <div className="ml-auto">
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
        </div>

        {/* Table/List Header */}
        <div className="hidden sm:grid bg-surface-tertiary/50 border border-edge-subtle rounded-t-xl px-4 py-3 gap-4"
          style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
        >
          {Array.from({ length: columnCount }).map((_, i) => (
            <Skeleton key={i} className="h-4" style={{ width: i === 0 ? "80%" : "60%" }} />
          ))}
        </div>

        {/* Table/List Rows */}
        <div className="bg-surface border-x border-b border-edge-subtle rounded-b-xl overflow-hidden">
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid px-4 py-4 gap-4 border-b border-edge-subtle last:border-b-0 items-center"
              style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
            >
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <div key={colIndex}>
                  {colIndex === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circle" className="h-8 w-8" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full max-w-[150px] mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ) : colIndex === columnCount - 1 ? (
                    <div className="flex justify-end gap-1">
                      <Skeleton variant="circle" className="h-8 w-8" />
                      <Skeleton variant="circle" className="h-8 w-8" />
                    </div>
                  ) : (
                    <Skeleton 
                      className="h-4" 
                      style={{ width: colIndex === 1 ? "70%" : "60%" }} 
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-6">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CardListSkeleton - Skeleton for card-based lists (mobile view)
 */
export function CardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4 sm:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface rounded-xl border border-edge-subtle p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="h-10 w-10" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-edge-subtle">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1">
              <Skeleton variant="circle" className="h-8 w-8" />
              <Skeleton variant="circle" className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
