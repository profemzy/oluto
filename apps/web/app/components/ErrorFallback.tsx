"use client";

import { useEffect } from "react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  errorInfo?: React.ErrorInfo;
}

/**
 * ErrorFallback - Graceful UI when React components crash
 * 
 * Provides:
 * - User-friendly error message (no technical jargon)
 * - Refresh button to recover
 * - Error details in development mode
 * - Reporting option for production errors
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  errorInfo,
}: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Log error to console in development
  useEffect(() => {
    if (isDevelopment) {
      console.error("Error caught by boundary:", error);
      if (errorInfo) {
        console.error("Component stack:", errorInfo.componentStack);
      }
    }
  }, [error, errorInfo, isDevelopment]);

  const handleRefresh = () => {
    // Attempt to reset the error boundary first
    resetErrorBoundary();
    // If that doesn't work, reload the page
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-10 w-10 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-heading sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-base text-muted">
          We&apos;re sorry, but something unexpected happened. 
          Please try refreshing the page or go back to the dashboard.
        </p>

        {/* Development: Show error details */}
        {isDevelopment && (
          <div className="mt-6 text-left">
            <div className="rounded-md bg-red-50 dark:bg-red-900/10 p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Error: {error.message}
              </p>
              {errorInfo?.componentStack && (
                <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Refresh Page
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center px-4 py-2 bg-surface-tertiary text-heading rounded-lg hover:bg-surface-hover transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-sm text-muted">
          Still having issues?{" "}
          <a
            href="mailto:support@oluto.ca"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
