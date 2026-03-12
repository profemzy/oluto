import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { api } from '@/app/lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('@/app/components/AuthProvider', () => ({
  useAuthContext: () => ({
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', async () => {
    vi.spyOn(api.auth, 'getCurrentUser').mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      business_id: 'biz-456',
      role: '2',
      is_active: true,
      full_name: 'Test User',
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);
  });

  it('should fetch current user and set user data', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      business_id: 'biz-456',
      role: '2',
      is_active: true,
      full_name: 'Test User',
    };

    vi.spyOn(api.auth, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api.businesses, 'getBusiness').mockResolvedValue({
      id: 'biz-456',
      name: 'Test Business',
      province: null,
      timezone: 'America/Toronto',
      tax_profile: null,
      created_at: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.timezone).toBe('America/Toronto');
  });

  it('should use default timezone when business timezone is not available', async () => {
    vi.spyOn(api.auth, 'getCurrentUser').mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      business_id: 'biz-456',
      role: '2',
      is_active: true,
      full_name: 'Test User',
    });

    vi.spyOn(api.businesses, 'getBusiness').mockResolvedValue({
      id: 'biz-456',
      name: 'Test Business',
      province: null,
      timezone: undefined as unknown as string,
      tax_profile: null,
      created_at: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.timezone).toBe('America/Toronto'); // Default timezone
  });

  it('should handle API errors gracefully', async () => {
    vi.spyOn(api.auth, 'getCurrentUser').mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('should return correct role based on user role value', async () => {
    vi.spyOn(api.auth, 'getCurrentUser').mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      business_id: 'biz-456',
      role: '2',
      is_active: true,
      full_name: 'Test User',
    });

    vi.spyOn(api.businesses, 'getBusiness').mockResolvedValue({
      id: 'biz-456',
      name: 'Test Business',
      province: null,
      timezone: 'America/Toronto',
      tax_profile: null,
      created_at: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe('admin');
    expect(result.current.canWrite).toBe(true);
    expect(result.current.canAdmin).toBe(true);
  });

  it('should handle viewer role correctly', async () => {
    vi.spyOn(api.auth, 'getCurrentUser').mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      business_id: 'biz-456',
      role: '0',
      is_active: true,
      full_name: 'Test User',
    });

    vi.spyOn(api.businesses, 'getBusiness').mockResolvedValue({
      id: 'biz-456',
      name: 'Test Business',
      province: null,
      timezone: 'America/Toronto',
      tax_profile: null,
      created_at: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe('viewer');
    expect(result.current.canWrite).toBe(false);
    expect(result.current.canAdmin).toBe(false);
  });

  it('should handle accountant role correctly', async () => {
    vi.spyOn(api.auth, 'getCurrentUser').mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      business_id: 'biz-456',
      role: '1',
      is_active: true,
      full_name: 'Test User',
    });

    vi.spyOn(api.businesses, 'getBusiness').mockResolvedValue({
      id: 'biz-456',
      name: 'Test Business',
      province: null,
      timezone: 'America/Toronto',
      tax_profile: null,
      created_at: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe('accountant');
    expect(result.current.canWrite).toBe(true);
    expect(result.current.canAdmin).toBe(false);
  });

  it('should not redirect when requireBusiness is false and user has no business', async () => {
    vi.spyOn(api.auth, 'getCurrentUser').mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      business_id: null,
      role: '2',
      is_active: true,
      full_name: 'Test User',
    });

    const { result } = renderHook(() => useAuth({ requireBusiness: false }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).not.toBeNull();
  });
});
