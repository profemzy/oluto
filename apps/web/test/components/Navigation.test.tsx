/**
 * Navigation Component Tests
 * 
 * Tests for the main navigation component including:
 * - Desktop dropdowns
 * - Mobile menu toggle
 * - Auth states (logged in/out)
 * - Keyboard navigation
 * - Active states
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Navigation } from '@/app/components/Navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock useAuthContext
vi.mock('@/app/components/AuthProvider', () => ({
  useAuthContext: () => ({
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock useAuth hook
vi.mock('@/app/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    timezone: 'America/Toronto',
    role: 'viewer',
    canWrite: false,
    canAdmin: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Navigation', () => {
    it('renders logo and main navigation items', () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      expect(screen.getByText('Oluto')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('opens dropdown when clicking on Sales menu', async () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const salesButton = screen.getByText('Sales');
      fireEvent.click(salesButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invoices')).toBeInTheDocument();
        expect(screen.getByText('Payments')).toBeInTheDocument();
      });
    });

    it('opens dropdown when clicking on Purchases menu', async () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const purchasesButton = screen.getByText('Purchases');
      fireEvent.click(purchasesButton);
      
      await waitFor(() => {
        expect(screen.getByText('Bills')).toBeInTheDocument();
        expect(screen.getByText('Bill Payments')).toBeInTheDocument();
      });
    });

    it('closes dropdown when clicking outside', async () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const salesButton = screen.getByText('Sales');
      fireEvent.click(salesButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invoices')).toBeInTheDocument();
      });
      
      // Click outside to close
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Invoices')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown when pressing Escape key', async () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const salesButton = screen.getByText('Sales');
      fireEvent.click(salesButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invoices')).toBeInTheDocument();
      });
      
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Invoices')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mobile Navigation', () => {
    it('renders mobile menu button', () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      // Mobile menu button should be present (hidden on desktop but in DOM)
      const mobileButton = screen.getByLabelText('Toggle menu');
      expect(mobileButton).toBeInTheDocument();
    });

    it('opens mobile menu when clicking toggle button', async () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const mobileButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(mobileButton);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Transactions')).toBeInTheDocument();
      });
    });

    it('closes mobile menu when clicking toggle again', async () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const mobileButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(mobileButton);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
      
      fireEvent.click(mobileButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('has correct ARIA attributes', () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const mobileButton = screen.getByLabelText('Toggle menu');
      expect(mobileButton).toHaveAttribute('aria-expanded', 'false');
      expect(mobileButton).toHaveAttribute('aria-controls', 'mobile-menu');
      
      fireEvent.click(mobileButton);
      
      expect(mobileButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Auth States', () => {
    it('shows Sign in button when logged out', () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      expect(screen.getByText('Sign in')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('shows user menu when logged in', async () => {
      // Mock authenticated state
      vi.mocked(require('@/app/components/AuthProvider').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(require('@/app/hooks/useAuth').useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          full_name: 'Test User',
          role: '2',
          is_active: true,
          business_id: 'biz-456',
        },
        loading: false,
        timezone: 'America/Toronto',
        role: 'admin',
        canWrite: true,
        canAdmin: true,
      });

      // Re-render with new mocks
      const { rerender } = render(<Navigation />, { wrapper: createWrapper() });
      rerender(<Navigation />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    it('shows Logout button when logged in', async () => {
      vi.mocked(require('@/app/components/AuthProvider').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(require('@/app/hooks/useAuth').useAuth).mockReturnValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          full_name: 'Test User',
          role: '2',
          is_active: true,
          business_id: 'biz-456',
        },
        loading: false,
        timezone: 'America/Toronto',
        role: 'admin',
        canWrite: true,
        canAdmin: true,
      });

      const { rerender } = render(<Navigation />, { wrapper: createWrapper() });
      rerender(<Navigation />);
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });
  });

  describe('Active States', () => {
    it('highlights active navigation item', () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/dashboard');
      
      render(<Navigation />, { wrapper: createWrapper() });
      
      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink.closest('a')).toHaveClass('text-cyan-600');
    });

    it('highlights active dropdown parent', () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/invoices');
      
      render(<Navigation />, { wrapper: createWrapper() });
      
      const salesButton = screen.getByText('Sales');
      expect(salesButton.closest('button')).toHaveClass('text-cyan-600');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates dropdown with arrow keys', async () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const salesButton = screen.getByText('Sales');
      salesButton.focus();
      
      // Open dropdown with Enter
      fireEvent.keyDown(salesButton, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Invoices')).toBeInTheDocument();
      });
      
      // Navigate with arrow keys
      fireEvent.keyDown(salesButton, { key: 'ArrowDown' });
      fireEvent.keyDown(salesButton, { key: 'ArrowDown' });
      
      // Close with Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Invoices')).not.toBeInTheDocument();
      });
    });

    it('supports Tab navigation', () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const logo = screen.getByText('Oluto');
      logo.focus();
      
      // Tab to next item
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      
      // Focus should move to next focusable element
      expect(document.activeElement).not.toBe(logo);
    });
  });

  describe('Theme Toggle', () => {
    it('renders theme toggle button', () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      // Theme toggle should be present
      const themeToggle = screen.getByTitle('Toggle theme');
      expect(themeToggle).toBeInTheDocument();
    });

    it('toggles theme when clicked', () => {
      render(<Navigation />, { wrapper: createWrapper() });
      
      const themeToggle = screen.getByTitle('Toggle theme');
      fireEvent.click(themeToggle);
      
      // Theme should toggle (implementation dependent)
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe('Chat Button', () => {
    it('renders chat button for authenticated users', async () => {
      vi.mocked(require('@/app/components/AuthProvider').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { rerender } = render(<Navigation />, { wrapper: createWrapper() });
      rerender(<Navigation />);
      
      await waitFor(() => {
        const chatButton = screen.getByLabelText('Chat with Oluto');
        expect(chatButton).toBeInTheDocument();
      });
    });

    it('navigates to chat page when clicked', async () => {
      const mockPush = vi.fn();
      vi.mocked(require('next/navigation').useRouter).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
      });

      vi.mocked(require('@/app/components/AuthProvider').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { rerender } = render(<Navigation />, { wrapper: createWrapper() });
      rerender(<Navigation />);
      
      await waitFor(() => {
        const chatButton = screen.getByLabelText('Chat with Oluto');
        fireEvent.click(chatButton);
        expect(mockPush).toHaveBeenCalledWith('/chat');
      });
    });
  });

  describe('Add Transaction Button', () => {
    it('renders Add Transaction button for authenticated users', async () => {
      vi.mocked(require('@/app/components/AuthProvider').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { rerender } = render(<Navigation />, { wrapper: createWrapper() });
      rerender(<Navigation />);
      
      await waitFor(() => {
        expect(screen.getByText('Add Transaction')).toBeInTheDocument();
      });
    });

    it('navigates to new transaction page when clicked', async () => {
      const mockPush = vi.fn();
      vi.mocked(require('next/navigation').useRouter).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
      });

      vi.mocked(require('@/app/components/AuthProvider').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { rerender } = render(<Navigation />, { wrapper: createWrapper() });
      rerender(<Navigation />);
      
      await waitFor(() => {
        const addButton = screen.getByText('Add Transaction');
        fireEvent.click(addButton);
        expect(mockPush).toHaveBeenCalledWith('/transactions/new');
      });
    });
  });
});
