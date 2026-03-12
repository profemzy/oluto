/**
 * ErrorAlert Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorAlert } from '@/app/components/ui/ErrorAlert';

describe('ErrorAlert', () => {
  it('renders error message', () => {
    render(<ErrorAlert error="This is an error message" />);
    
    expect(screen.getByText('This is an error message')).toBeInTheDocument();
  });

  it('does not render when no error', () => {
    const { container } = render(<ErrorAlert error="" />);
    
    expect(container).toBeEmptyDOMElement();
  });

  it('has role="alert" for screen readers', () => {
    render(<ErrorAlert error="Error message" />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live="assertive" for immediate announcement', () => {
    render(<ErrorAlert error="Error message" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('has correct styling classes', () => {
    render(<ErrorAlert error="Error message" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-gradient-to-r');
    expect(alert).toHaveClass('from-red-50');
    expect(alert).toHaveClass('to-rose-50');
  });

  it('applies custom className', () => {
    render(<ErrorAlert error="Error message" className="custom-class" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
  });

  it('renders long error messages', () => {
    const longError = 'This is a very long error message that should wrap properly and remain readable';
    render(<ErrorAlert error={longError} />);
    
    expect(screen.getByText(longError)).toBeInTheDocument();
  });
});
