/**
 * Shared utility functions.
 */

/** Convert snake_case/kebab-case to Title Case. */
export function labelify(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
