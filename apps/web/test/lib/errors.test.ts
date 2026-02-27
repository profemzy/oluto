import { describe, it, expect } from 'vitest';
import {
  ApiError,
  ValidationError,
  NetworkError,
  AuthError,
  TimeoutError,
  isApiError,
  isValidationError,
  isNetworkError,
  isAuthError,
  getErrorMessage,
} from '../../app/lib/errors';

describe('Error Types', () => {
  describe('ApiError', () => {
    it('should create an ApiError with all properties', () => {
      const error = new ApiError('Test error', 400, 'BAD_REQUEST', { field: ['invalid'] });
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.details).toEqual({ field: ['invalid'] });
      expect(error.name).toBe('ApiError');
    });

    it('should detect client errors (4xx)', () => {
      const error400 = new ApiError('Bad request', 400);
      const error404 = new ApiError('Not found', 404);
      const error500 = new ApiError('Server error', 500);

      expect(error400.isClientError()).toBe(true);
      expect(error404.isClientError()).toBe(true);
      expect(error500.isClientError()).toBe(false);
    });

    it('should detect server errors (5xx)', () => {
      const error400 = new ApiError('Bad request', 400);
      const error500 = new ApiError('Server error', 500);

      expect(error400.isServerError()).toBe(false);
      expect(error500.isServerError()).toBe(true);
    });

    it('should detect auth errors (401, 403)', () => {
      const error401 = new ApiError('Unauthorized', 401);
      const error403 = new ApiError('Forbidden', 403);
      const error404 = new ApiError('Not found', 404);

      expect(error401.isAuthError()).toBe(true);
      expect(error403.isAuthError()).toBe(true);
      expect(error404.isAuthError()).toBe(false);
    });

    it('should detect validation errors (422)', () => {
      const error422 = new ApiError('Validation failed', 422);
      const error400 = new ApiError('Bad request', 400);

      expect(error422.isValidationError()).toBe(true);
      expect(error400.isValidationError()).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with fields', () => {
      const fields = { email: ['Invalid email'], password: ['Too short'] };
      const error = new ValidationError('Validation failed', fields);

      expect(error.message).toBe('Validation failed');
      expect(error.fields).toEqual(fields);
      expect(error.name).toBe('ValidationError');
    });

    it('should get field errors', () => {
      const fields = { email: ['Invalid email'], password: ['Too short'] };
      const error = new ValidationError('Validation failed', fields);

      expect(error.getFieldErrors('email')).toEqual(['Invalid email']);
      expect(error.getFieldErrors('password')).toEqual(['Too short']);
      expect(error.getFieldErrors('nonexistent')).toEqual([]);
    });

    it('should check if field has errors', () => {
      const fields = { email: ['Invalid email'] };
      const error = new ValidationError('Validation failed', fields);

      expect(error.hasFieldErrors('email')).toBe(true);
      expect(error.hasFieldErrors('password')).toBe(false);
    });

    it('should get all error fields', () => {
      const fields = { email: ['Invalid'], password: ['Too short'] };
      const error = new ValidationError('Validation failed', fields);

      expect(error.getErrorFields()).toEqual(['email', 'password']);
    });
  });

  describe('NetworkError', () => {
    it('should create a NetworkError with default message', () => {
      const error = new NetworkError();
      expect(error.message).toBe('Network connection failed');
      expect(error.name).toBe('NetworkError');
    });

    it('should create a NetworkError with custom message', () => {
      const error = new NetworkError('Connection timeout');
      expect(error.message).toBe('Connection timeout');
    });
  });

  describe('AuthError', () => {
    it('should create an AuthError with default values', () => {
      const error = new AuthError();
      expect(error.message).toBe('Authentication failed');
      expect(error.reason).toBe('invalid');
      expect(error.name).toBe('AuthError');
    });

    it('should create an AuthError with custom values', () => {
      const error = new AuthError('Session expired', 'expired');
      expect(error.message).toBe('Session expired');
      expect(error.reason).toBe('expired');
    });
  });

  describe('TimeoutError', () => {
    it('should create a TimeoutError with default values', () => {
      const error = new TimeoutError();
      expect(error.message).toBe('Request timed out');
      expect(error.timeoutMs).toBe(30000);
      expect(error.name).toBe('TimeoutError');
    });

    it('should create a TimeoutError with custom values', () => {
      const error = new TimeoutError('Operation timeout', 5000);
      expect(error.message).toBe('Operation timeout');
      expect(error.timeoutMs).toBe(5000);
    });
  });
});

describe('Type Guards', () => {
  it('should identify ApiError correctly', () => {
    const apiError = new ApiError('API error', 500);
    const regularError = new Error('Regular error');

    expect(isApiError(apiError)).toBe(true);
    expect(isApiError(regularError)).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError('string')).toBe(false);
  });

  it('should identify ValidationError correctly', () => {
    const validationError = new ValidationError('Validation failed', {});
    const regularError = new Error('Regular error');

    expect(isValidationError(validationError)).toBe(true);
    expect(isValidationError(regularError)).toBe(false);
  });

  it('should identify NetworkError correctly', () => {
    const networkError = new NetworkError();
    const regularError = new Error('Regular error');

    expect(isNetworkError(networkError)).toBe(true);
    expect(isNetworkError(regularError)).toBe(false);
  });

  it('should identify AuthError correctly', () => {
    const authError = new AuthError();
    const regularError = new Error('Regular error');

    expect(isAuthError(authError)).toBe(true);
    expect(isAuthError(regularError)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('should return user-friendly messages for API errors', () => {
    expect(getErrorMessage(new ApiError('Test', 400))).toBe('Invalid request. Please check your input.');
    expect(getErrorMessage(new ApiError('Test', 401))).toBe('Your session has expired. Please sign in again.');
    expect(getErrorMessage(new ApiError('Test', 403))).toBe('You do not have permission to perform this action.');
    expect(getErrorMessage(new ApiError('Test', 404))).toBe('The requested resource was not found.');
    expect(getErrorMessage(new ApiError('Test', 500))).toBe('An unexpected error occurred. Please try again later.');
  });

  it('should return custom message if provided in ApiError', () => {
    expect(getErrorMessage(new ApiError('Custom error', 422))).toBe('Custom error');
  });

  it('should return validation error message', () => {
    const error = new ValidationError('Validation failed', { field: ['error'] });
    expect(getErrorMessage(error)).toBe('Please correct the errors in 1 field.');
  });

  it('should return network error message', () => {
    expect(getErrorMessage(new NetworkError())).toBe('Network connection failed. Please check your internet connection.');
  });

  it('should return auth error message', () => {
    expect(getErrorMessage(new AuthError())).toBe('Authentication failed. Please check your credentials.');
    expect(getErrorMessage(new AuthError('Expired', 'expired'))).toBe('Your session has expired. Please sign in again.');
  });

  it('should return timeout error message', () => {
    expect(getErrorMessage(new TimeoutError())).toBe('The request took too long. Please try again.');
  });

  it('should handle regular errors', () => {
    expect(getErrorMessage(new Error('Something happened'))).toBe('Something happened');
  });

  it('should handle unknown errors', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred.');
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred.');
    expect(getErrorMessage('string error')).toBe('An unexpected error occurred.');
  });
});
