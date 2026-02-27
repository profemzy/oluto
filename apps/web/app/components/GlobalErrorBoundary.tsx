"use client";

import React, { Component, ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * GlobalErrorBoundary - Catches JavaScript errors anywhere in the child component tree
 * 
 * Features:
 * - Prevents white screen of death on React crashes
 * - Logs errors for monitoring (console in dev, could be Sentry in prod)
 * - Provides reset functionality to attempt recovery
 * - Graceful fallback UI with ErrorFallback component
 * 
 * Usage:
 * ```tsx
 * <GlobalErrorBoundary>
 *   <YourComponent />
 * </GlobalErrorBoundary>
 * ```
 * 
 * Integration: Wrap around main content in layout.tsx or page-specific areas
 */
export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state so the next render shows the fallback UI
   * This is a static method - runs during render phase
   */
  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Log error details when caught
   * This runs during commit phase - safe for side effects
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Log to console (development)
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalErrorBoundary] Caught error:", error);
      console.error("[GlobalErrorBoundary] Component stack:", errorInfo.componentStack);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // TODO: Send to error monitoring service (e.g., Sentry) in production
    // if (process.env.NODE_ENV === "production") {
    //   Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  /**
   * Reset the error boundary to attempt recovery
   */
  resetErrorBoundary = (): void => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided, otherwise use default ErrorFallback
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo ?? undefined}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

/**
 * withErrorBoundary HOC - Wrap any component with error boundary
 * 
 * Usage:
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent);
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<GlobalErrorBoundaryProps, "children">
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <GlobalErrorBoundary {...boundaryProps}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WithErrorBoundary;
}
