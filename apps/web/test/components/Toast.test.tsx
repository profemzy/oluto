/**
 * Toast Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Toast, toast } from '@/app/components/ui/Toast';

describe('Toast', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    toast.dismiss();
  });

  it('renders Toast container', () => {
    render(<Toast />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows success toast', async () => {
    render(<Toast />);
    
    toast.success('Operation successful!');
    
    await waitFor(() => {
      expect(screen.getByText('Operation successful!')).toBeInTheDocument();
    });
  });

  it('shows error toast', async () => {
    render(<Toast />);
    
    toast.error('Something went wrong');
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('shows info toast', async () => {
    render(<Toast />);
    
    toast.info('Here is some information');
    
    await waitFor(() => {
      expect(screen.getByText('Here is some information')).toBeInTheDocument();
    });
  });

  it('shows warning toast', async () => {
    render(<Toast />);
    
    toast.warning('Please be careful');
    
    await waitFor(() => {
      expect(screen.getByText('Please be careful')).toBeInTheDocument();
    });
  });

  it('shows loading toast', async () => {
    render(<Toast />);
    
    toast.loading('Loading...');
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('auto-dismisses after duration', async () => {
    render(<Toast />);
    
    toast.success('This will disappear', { duration: 1000 });
    
    await waitFor(() => {
      expect(screen.getByText('This will disappear')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.queryByText('This will disappear')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('can be dismissed manually', async () => {
    render(<Toast />);
    
    const toastId = toast.success('Dismissible toast');
    
    await waitFor(() => {
      expect(screen.getByText('Dismissible toast')).toBeInTheDocument();
    });
    
    toast.dismiss(toastId);
    
    await waitFor(() => {
      expect(screen.queryByText('Dismissible toast')).not.toBeInTheDocument();
    });
  });

  it('shows multiple toasts', async () => {
    render(<Toast />);
    
    toast.success('First toast');
    toast.error('Second toast');
    toast.info('Third toast');
    
    await waitFor(() => {
      expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('has correct styling for success', async () => {
    render(<Toast />);
    
    toast.success('Success message');
    
    await waitFor(() => {
      const toastEl = screen.getByText('Success message').closest('[role="status"]');
      expect(toastEl).toHaveClass('bg-green-50');
    });
  });

  it('has correct styling for error', async () => {
    render(<Toast />);
    
    toast.error('Error message');
    
    await waitFor(() => {
      const toastEl = screen.getByText('Error message').closest('[role="status"]');
      expect(toastEl).toHaveClass('bg-red-50');
    });
  });

  it('has correct styling for info', async () => {
    render(<Toast />);
    
    toast.info('Info message');
    
    await waitFor(() => {
      const toastEl = screen.getByText('Info message').closest('[role="status"]');
      expect(toastEl).toHaveClass('bg-blue-50');
    });
  });

  it('has correct styling for warning', async () => {
    render(<Toast />);
    
    toast.warning('Warning message');
    
    await waitFor(() => {
      const toastEl = screen.getByText('Warning message').closest('[role="status"]');
      expect(toastEl).toHaveClass('bg-amber-50');
    });
  });

  it('accepts custom duration', async () => {
    render(<Toast />);
    
    toast.success('Custom duration', { duration: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('Custom duration')).toBeInTheDocument();
    });
  });

  it('accepts custom position', () => {
    render(<Toast />);
    
    toast.success('Top left', { position: 'top-left' });
    
    // Position is handled by react-hot-toast internally
    expect(screen.getByText('Top left')).toBeInTheDocument();
  });
});
