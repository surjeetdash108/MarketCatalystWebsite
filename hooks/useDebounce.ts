import { useEffect, useState } from "react";

/**
 * Debounce a value by `delayMs` milliseconds.
 *
 * Returns a copy of `value` that only updates after the caller has stopped
 * changing it for `delayMs`. Useful for search inputs: the raw state drives
 * the controlled input (so typing is instant), while the debounced copy
 * triggers the actual query, avoiding a request per keystroke.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
