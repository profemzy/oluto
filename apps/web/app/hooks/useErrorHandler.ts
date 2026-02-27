"use client";

import { useCallback } from "react";
import { 
  ApiError, 
  ValidationError, 
  NetworkError, 
  AuthError,
  getErrorMessage,
  logError 
} from "@/app/lib/errors";
import { toastError, toastWarning } from "@/app/lib/toast";

/**
 * Options for error handling
 */
interface ErrorHandlerOptions {
  /** Context string for logging */
  context?: string;
  /** Whether to show toast notification (default: true) */
  showToast?: boolean;
  /** Custom message to override default */
  customMessage?: string;
  /** Callback for specific error types */
  onAuthError?: () => void;
  onValidationError?: (error: ValidationError) => void;
  onNetworkError?: () => void;
}

/**
 * Hook for consistent error handling across the application
 * 
 * Provides structured error handling with:
 * - Automatic logging
 * - User-friendly toast notifications
 * - Type-specific callbacks
 * - Optional custom messages
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const handleError = useErrorHandler();
 *   
 *   const submitData = async () => {
 *     try {
 *       await api.saveData(data);
 *     } catch (error) {
 *       handleError(error, { context: 'saveData' });
 *     }
 *   };
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // With custom callbacks
 * const handleError = useErrorHandler({
 *   context: 'paymentProcessing',
 *   onAuthError: () => router.push('/auth/login'),
 *   onValidationError: (err) => setFieldErrors(err.fields),
 * });
 * ```
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    context,
    showToast = true,
    customMessage,
    onAuthError,
    onValidationError,
    onNetworkError,
  } = options;

  return useCallback(
    (error: unknown) => {
      // Always log the error
      logError(error, context);

      // Handle specific error types
      if (error instanceof ApiError) {
        // Handle authentication errors
        if (error.isAuthError()) {
          if (onAuthError) {
            onAuthError();
          } else if (showToast) {
            toastWarning(customMessage || getErrorMessage(error));
          }
          return;
        }

        // Handle validation errors
        if (error.isValidationError()) {
          const validationError = new ValidationError(
            error.message,
            error.details || {}
          );
          if (onValidationError) {
            onValidationError(validationError);
          } else if (showToast) {
            toastError(customMessage || getErrorMessage(error));
          }
          return;
        }

        // Handle server errors (5xx)
        if (error.isServerError()) {
          if (showToast) {
            toastError(customMessage || getErrorMessage(error));
          }
          return;
        }

        // Handle other client errors
        if (showToast) {
          toastError(customMessage || getErrorMessage(error));
        }
        return;
      }

      // Handle validation errors
      if (error instanceof ValidationError) {
        if (onValidationError) {
          onValidationError(error);
        } else if (showToast) {
          toastError(customMessage || getErrorMessage(error));
        }
        return;
      }

      // Handle network errors
      if (error instanceof NetworkError) {
        if (onNetworkError) {
          onNetworkError();
        } else if (showToast) {
          toastError(customMessage || getErrorMessage(error));
        }
        return;
      }

      // Handle auth errors
      if (error instanceof AuthError) {
        if (onAuthError) {
          onAuthError();
        } else if (showToast) {
          toastWarning(customMessage || getErrorMessage(error));
        }
        return;
      }

      // Handle generic errors
      if (showToast) {
        toastError(customMessage || getErrorMessage(error));
      }
    },
    [context, showToast, customMessage, onAuthError, onValidationError, onNetworkError]
  );
}

/**
 * Convenience hook for form validation error handling
 * 
 * @example
 * ```typescript
 * const handleValidationError = useValidationHandler();
 * 
 * try {
 *   await api.createTransaction(data);
 * } catch (error) {
 *   const fieldErrors = handleValidationError(error);
 *   if (fieldErrors) {
 *     setErrors(fieldErrors);
 *   }
 * }
 * ```
 */
export function useValidationHandler() {
  return useCallback((error: unknown): Record<string, string[]> | null => {
    logError(error, 'formValidation');

    if (error instanceof ValidationError) {
      return error.fields;
    }

    if (error instanceof ApiError && error.isValidationError() && error.details) {
      return error.details;
    }

    // Show generic error toast for non-validation errors
    toastError(getErrorMessage(error));
    return null;
  }, []);
}

/**
 * Convenience hook for async operation error handling with loading state
 * 
 * @example
 * ```typescript
 * const { execute, isLoading, error } = useAsyncHandler(async () => {
 *   await api.expensiveOperation();
 * });
 * ```
 */
export function useAsyncHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  asyncFn: T,
  options: ErrorHandlerOptions = {}
) {
  const handleError = useErrorHandler(options);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      try {
        return (await asyncFn(...args)) as ReturnType<T>;
      } catch (error) {
        handleError(error);
        return undefined;
      }
    },
    [asyncFn, handleError]
  );

  return { execute };
}
