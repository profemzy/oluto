/**
 * Utility functions for common operations
 */

/**
 * Combines multiple class names into a single string
 * Filters out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
