/**
 * Debounce Utility Function
 *
 * Creates a debounced version of a function that delays its execution until after
 * a specified wait time has elapsed since the last time it was invoked.
 *
 * This is useful for limiting the rate at which a function can fire, particularly
 * for performance optimization in scenarios like:
 * - Search input fields (wait for user to stop typing)
 * - Window resize handlers (wait for user to finish resizing)
 * - API calls triggered by user interactions
 *
 * @template T - The type of the function being debounced
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay execution
 * @returns A debounced version of the original function
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * Only the last call will execute after 300ms of inactivity
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this will execute
 * ```
 */
export default function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  // Store the timeout ID to allow clearing previous timeouts
  let timeout: NodeJS.Timeout;

  // Return a new function that wraps the original with debounce logic
  return (...args: Parameters<T>) => {
    // Clear any existing timeout to reset the delay
    clearTimeout(timeout);

    // Set a new timeout to execute the function after the wait period
    timeout = setTimeout(() => func(...args), wait);
  };
}
