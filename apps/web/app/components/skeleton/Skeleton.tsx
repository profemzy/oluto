"use client";

import { cn } from "@/app/lib/utils";

import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circle" | "rounded";
  style?: CSSProperties;
}

/**
 * Base Skeleton component for loading states
 * Uses animate-pulse for a subtle pulsing animation
 */
export function Skeleton({ className, variant = "default", style }: SkeletonProps) {
  const baseStyles = "animate-pulse bg-surface-tertiary";
  
  const variantStyles = {
    default: "rounded-md",
    circle: "rounded-full",
    rounded: "rounded-xl",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton text for loading text content
 */
export function SkeletonText({ 
  lines = 1, 
  className,
  lastLineWidth = "100%"
}: { 
  lines?: number; 
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 && lines > 1 ? lastLineWidth : "100%" }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton card for stat cards or content cards
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-surface rounded-2xl border border-edge-subtle p-6", className)}>
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-10 w-32 mb-2" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

/**
 * Skeleton stat card with icon placeholder
 */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      "bg-surface rounded-2xl border border-edge-subtle p-6 shadow-lg",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-10 w-36 mb-4" />
      <Skeleton className="h-2.5 w-full rounded-full" />
    </div>
  );
}

/**
 * Skeleton list item
 */
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4", className)}>
      <Skeleton variant="circle" className="h-10 w-10" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

/**
 * Skeleton table row
 */
export function SkeletonTableRow({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === 0 ? "30%" : `${70 / (columns - 1)}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton button
 */
export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("h-10 w-32 rounded-xl", className)}
    />
  );
}
