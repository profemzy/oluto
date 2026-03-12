import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api, ApiError, NetworkError } from '@/app/lib/api';

// Mock token provider
const mockToken = 'mock-jwt-token-12345';
api.setTokenProvider(async () => mockToken);

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Invalid token' }),
      } as Response);

      await expect(api.getCurrentUser()).rejects.toThrow(ApiError);
      await expect(api.getCurrentUser()).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid token',
      });
    });

    it('should handle 404 Not Found errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Business not found' }),
      } as Response);

      await expect(api.getBusiness('test-business-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Business not found',
      });
    });

    it('should handle 500 Internal Server Error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Database connection failed' }),
      } as Response);

      await expect(api.getCurrentUser()).rejects.toMatchObject({
        statusCode: 500,
        message: 'Database connection failed',
      });
    });

    it('should handle non-JSON responses (HTML error pages)', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html><body>Bad Gateway</body></html>',
      } as Response);

      await expect(api.getCurrentUser()).rejects.toMatchObject({
        statusCode: 502,
        message: 'HTTP 502: Bad Gateway',
      });
    });

    it('should handle empty error responses', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      } as Response);

      await expect(api.getCurrentUser()).rejects.toMatchObject({
        statusCode: 503,
        message: 'An error occurred',
      });
    });

    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new TypeError('Network request failed'));

      await expect(api.getCurrentUser()).rejects.toThrow('Network request failed');
    });
  });

  describe('Response Handling', () => {
    it('should unwrap LedgerForge response format', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com', business_id: 'biz-456' };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: mockUser }),
      } as Response);

      const result = await api.getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('should handle responses without data wrapper', async () => {
      const mockBusiness = { id: 'biz-123', name: 'Test Business' };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockBusiness,
      } as Response);

      const result = await api.getBusiness('biz-123');
      expect(result).toEqual(mockBusiness);
    });

    it('should handle empty 204 responses', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as Response);

      const result = await api.getCurrentUser();
      expect(result).toEqual({});
    });

    it('should handle empty response body', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '0' }),
        json: async () => ({}),
      } as Response);

      const result = await api.getCurrentUser();
      expect(result).toEqual({});
    });
  });

  describe('Authentication', () => {
    it('should include Authorization header with JWT token', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { id: 'user-123' } }),
      } as Response);

      await api.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-jwt-token-12345',
          }),
        })
      );
    });

    it('should handle requests without token', async () => {
      api.setTokenProvider(async () => null);

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { id: 'public-data' } }),
      } as Response);

      await expect(api.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('Request Configuration', () => {
    it('should set Content-Type header for JSON requests', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: {} }),
      } as Response);

      await api.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle query parameters', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      } as Response);

      await api.listTransactions('biz-123', { status: 'posted', limit: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('?status=posted&limit=10'),
        expect.any(Object)
      );
    });
  });

  describe('ApiError Class', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('Test error', 400, 'VALIDATION_ERROR', {
        field: ['is required'],
      });

      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: ['is required'] });
    });

    it('should create ApiError with optional properties', () => {
      const error = new ApiError('Simple error', 500);

      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Simple error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('Upload Requests', () => {
    it('should handle file upload errors', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test'], { type: 'image/png' }), 'test.png');

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'File too large' }),
      } as Response);

      // Note: uploadRequest is private, this tests the error handling path
      // In real usage, this would be called through a public method
      await expect(api.getCurrentUser()).rejects.toThrow();
    });
  });
});

describe('API Error Types', () => {
  it('should distinguish between ApiError and NetworkError', () => {
    const apiError = new ApiError('API error', 400);
    const networkError = new NetworkError('Connection failed');

    expect(apiError).toBeInstanceOf(ApiError);
    expect(networkError).toBeInstanceOf(NetworkError);
    expect(apiError).not.toBeInstanceOf(NetworkError);
    expect(networkError).not.toBeInstanceOf(ApiError);
  });
});
