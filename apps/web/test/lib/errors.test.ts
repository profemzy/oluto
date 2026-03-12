import { describe, it, expect } from 'vitest';
import { ApiError, NetworkError, ValidationError, getErrorMessage } from '@/app/lib/errors';

describe('Error Classes', () => {
  describe('ApiError', () => {
    it('should create ApiError with all properties', () => {
      const error = new ApiError('Not found', 404, 'NOT_FOUND', { id: ['not found'] });

      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.details).toEqual({ id: ['not found'] });
    });

    it('should create ApiError with minimal properties', () => {
      const error = new ApiError('Error', 500);

      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should be instance of Error', () => {
      const error = new ApiError('Test', 400);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('NetworkError', () => {
    it('should create NetworkError with default message', () => {
      const error = new NetworkError();

      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Network connection failed');
    });

    it('should create NetworkError with custom message', () => {
      const error = new NetworkError('Custom network error');

      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Custom network error');
    });

    it('should be instance of Error', () => {
      const error = new NetworkError();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with field errors', () => {
      const fieldErrors = { email: ['invalid'], password: ['too short'] };
      const error = new ValidationError(fieldErrors);

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.fieldErrors).toEqual(fieldErrors);
    });

    it('should create ValidationError with custom message', () => {
      const fieldErrors = { email: ['invalid'] };
      const error = new ValidationError(fieldErrors, 'Custom validation error');

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Custom validation error');
      expect(error.fieldErrors).toEqual(fieldErrors);
    });

    it('should be instance of Error', () => {
      const error = new ValidationError({});
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('getErrorMessage', () => {
    it('should return message from ApiError', () => {
      const error = new ApiError('API error message', 400);
      expect(getErrorMessage(error)).toBe('API error message');
    });

    it('should return message from NetworkError', () => {
      const error = new NetworkError('Network error message');
      expect(getErrorMessage(error)).toBe('Network error message');
    });

    it('should return message from ValidationError', () => {
      const error = new ValidationError({ email: ['invalid'] }, 'Validation failed');
      expect(getErrorMessage(error)).toBe('Validation failed');
    });

    it('should return message from regular Error', () => {
      const error = new Error('Regular error');
      expect(getErrorMessage(error)).toBe('Regular error');
    });

    it('should return string message', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown types', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(getErrorMessage(123)).toBe('An unexpected error occurred');
      expect(getErrorMessage({})).toBe('An unexpected error occurred');
    });

    it('should handle error objects with message property', () => {
      const error = { message: 'Object error message' };
      expect(getErrorMessage(error)).toBe('Object error message');
    });
  });
});

describe('Error Type Guards', () => {
  it('should identify ApiError', () => {
    const error = new ApiError('Test', 400);
    expect(error instanceof ApiError).toBe(true);
    expect(error instanceof NetworkError).toBe(false);
  });

  it('should identify NetworkError', () => {
    const error = new NetworkError();
    expect(error instanceof NetworkError).toBe(true);
    expect(error instanceof ApiError).toBe(false);
  });

  it('should identify ValidationError', () => {
    const error = new ValidationError({});
    expect(error instanceof ValidationError).toBe(true);
  });
});
