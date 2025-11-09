import { useRef, useCallback } from 'react';

/**
 * React hook for debounced callbacks
 *
 * IMPORTANT: Use this instead of the old debounce() utility!
 *
 * The old approach had issues:
 * - Created new function on each call, breaking useCallback
 * - Closure captured stale values if deps changed
 * - Didn't preserve function reference stability
 *
 * This hook:
 * - Returns stable debounced function reference
 * - Properly handles dependency changes
 * - Works correctly with useCallback and other React patterns
 *
 * @example
 * const debouncedSave = useDebouncedCallback((data) => {
 *   saveToBackend(data);
 * }, 500, [saveToBackend]);
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number,
    dependencies?: React.DependencyList
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay, ...(dependencies ?? [])]);
}