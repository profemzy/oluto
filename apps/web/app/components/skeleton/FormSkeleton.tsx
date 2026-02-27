"use client";

import { Skeleton, SkeletonButton } from "./Skeleton";

interface FormSkeletonProps {
  title?: string;
  fieldCount?: number;
  showReceiptUpload?: boolean;
}

/**
 * FormSkeleton - Skeleton for form pages (new/edit transaction, invoice, etc.)
 */
export function FormSkeleton({
  title = "Form",
  fieldCount = 6,
  showReceiptUpload = false,
}: FormSkeletonProps) {
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
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg p-6 sm:p-8">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: fieldCount }).map((_, i) => (
                <div key={i} className={i === 0 || i === 1 ? "" : i === 2 ? "md:col-span-2" : ""}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>

            {/* Receipt Upload Section Skeleton */}
            {showReceiptUpload && (
              <div className="mt-8 pt-8 border-t border-edge-subtle">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-4 w-64 mb-6" />
                <div className="border-2 border-dashed border-edge-subtle rounded-xl p-8">
                  <div className="text-center">
                    <Skeleton variant="circle" className="h-16 w-16 mx-auto mb-4" />
                    <Skeleton className="h-5 w-48 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-edge-subtle flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Skeleton className="h-12 w-full sm:w-32 rounded-xl" />
              <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CompactFormSkeleton - Smaller form skeleton for simple forms
 */
export function CompactFormSkeleton({ fieldCount = 4 }: { fieldCount?: number }) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="bg-surface/90 backdrop-blur-sm border-b border-edge/80 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg p-6">
            <div className="space-y-5">
              {Array.from({ length: fieldCount }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-edge-subtle flex justify-end gap-3">
              <Skeleton className="h-12 w-28 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
