"use client";

/**
 * SkipLink - Accessibility component for keyboard navigation
 * 
 * Allows keyboard users to skip repetitive navigation and jump 
 * directly to main content. Essential for WCAG 2.1 compliance.
 * 
 * Usage: Place as first focusable element in the page, before navigation.
 * The target element should have id="main-content" (already in layout.tsx)
 * 
 * @see https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 focus:z-[100] focus:px-4 focus:py-2 
                 focus:bg-cyan-600 focus:text-white 
                 focus:rounded-lg focus:font-medium
                 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cyan-600"
    >
      Skip to main content
    </a>
  );
}
