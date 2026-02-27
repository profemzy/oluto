"use client";

import { Skeleton, SkeletonStatCard } from "./Skeleton";

/**
 * DashboardSkeleton - Skeleton UI for the dashboard page
 * 
 * Matches the layout of the actual dashboard to prevent layout shift
 * during data loading.
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      {/* Page Header Skeleton */}
      <div className="bg-surface/90 backdrop-blur-sm border-b border-edge/80 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>

        {/* Outstanding Summary Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface rounded-2xl border border-blue-100 p-5 shadow-md">
            <div className="flex items-center gap-4">
              <Skeleton variant="circle" className="h-10 w-10" />
              <div className="flex-1">
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-6 w-24 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-2xl border border-amber-100 p-5 shadow-md">
            <div className="flex items-center gap-4">
              <Skeleton variant="circle" className="h-10 w-10" />
              <div className="flex-1">
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-6 w-24 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cashflow + Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cashflow Breakdown Skeleton */}
              <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg p-6">
                <Skeleton className="h-6 w-40 mb-6" />
                <div className="space-y-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Status Skeleton */}
              <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Skeleton variant="circle" className="h-2.5 w-2.5" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exceptions Inbox Skeleton */}
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg">
              <div className="p-6 border-b border-edge-subtle flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
              <div className="divide-y divide-edge-subtle">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-start gap-3">
                    <Skeleton variant="circle" className="h-8 w-8 flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info Card Skeleton */}
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" className="h-12 w-12" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-edge-subtle">
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            {/* Recent Activity Skeleton */}
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg">
              <div className="p-6 border-b border-edge-subtle">
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="p-4 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton variant="circle" className="h-8 w-8" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-edge-subtle">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* AR Aging Skeleton */}
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg">
              <div className="p-6 border-b border-edge-subtle flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
                <div className="pt-3 border-t border-edge-subtle flex items-center justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border-2 border-edge">
                    <Skeleton variant="rounded" className="h-9 w-9" />
                    <Skeleton className="h-4 w-28 flex-1" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
