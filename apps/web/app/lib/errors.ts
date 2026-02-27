/**
 * Structured error types for consistent error handling
 * 
 * These error classes provide type-safe error handling with additional
 * context like HTTP status codes, error codes, and validation details.
 * 
 * @example
 * ```typescript
 * try {
 *   await api.createTransaction(data);
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     switch (error.statusCode) {
 *       case 401: // Handle unauthorized
 *       case 422: // Handle validation error
 *     }
 *   }
 * }
 * ```
 */

/**
 * API Error with HTTP status code and optional error code/details
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if this is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if this is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.statusCode === 422;
  }
}

/**
 * Validation Error with field-level error details
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(fieldName: string): string[] {
    return this.fields[fieldName] || [];
  }

  /**
   * Check if a field has errors
   */
  hasFieldErrors(fieldName: string): boolean {
    return fieldName in this.fields && this.fields[fieldName].length > 0;
  }

  /**
   * Get all field names with errors
   */
  getErrorFields(): string[] {
    return Object.keys(this.fields);
  }
}

/**
 * Network Error for connection failures
 */
export class NetworkError extends Error {
  constructor(message = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
}

/**
 * Authentication Error for login/session issues
 */
export class AuthError extends Error {
  constructor(
    message = 'Authentication failed',
    public reason: 'expired' | 'invalid' | 'missing' | 'network' = 'invalid'
  ) {
    super(message);
    this.name = 'AuthError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

/**
 * Timeout Error for requests that take too long
 */
export class TimeoutError extends Error {
  constructor(
    message = 'Request timed out',
    public timeoutMs: number = 30000
  ) {
    super(message);
    this.name = 'TimeoutError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
}

/**
 * Error type guard functions
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof AuthError;
};

/**
 * Get a user-friendly error message from any error type
 */
export function getErrorMessage(error: unknown, preferUserMessage: boolean = false): string {
  if (error instanceof ApiError) {
    // If user message is preferred and exists, use it (for 400/422 which often have specific validation messages)
    if (preferUserMessage && error.message && (error.statusCode === 400 || error.statusCode === 422)) {
      return error.message;
    }
    
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return error.message || 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'An unexpected error occurred. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service is currently unavailable. Please try again later.';
      default:
        return error.message || 'Something went wrong.';
    }
  }

  if (error instanceof ValidationError) {
    const fieldCount = Object.keys(error.fields).length;
    return `Please correct the errors in ${fieldCount} field${fieldCount === 1 ? '' : 's'}.`;
  }

  if (error instanceof NetworkError) {
    return 'Network connection failed. Please check your internet connection.';
  }

  if (error instanceof AuthError) {
    if (error.reason === 'expired') {
      return 'Your session has expired. Please sign in again.';
    }
    return 'Authentication failed. Please check your credentials.';
  }

  if (error instanceof TimeoutError) {
    return 'The request took too long. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

/**
 * Log error to console with structured formatting
 * TODO: Integrate with error tracking service (Sentry, etc.)
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '';

  if (error instanceof ApiError) {
    console.error(
      `${timestamp} ${prefix} API Error ${error.statusCode}:`,
      {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      }
    );
    // TODO: Send to error tracking service
    // if (error.statusCode >= 500) {
    //   Sentry.captureException(error, { extra: { context } });
    // }
  } else if (error instanceof Error) {
    console.error(
      `${timestamp} ${prefix} Error:`,
      {
        message: error.message,
        name: error.name,
        stack: error.stack,
      }
    );
    // TODO: Send to error tracking service
    // Sentry.captureException(error, { extra: { context } });
  } else {
    console.error(`${timestamp} ${prefix} Unknown error:`, error);
  }
}
