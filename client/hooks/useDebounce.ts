import { useEffect, useState } from "react";

/**
 * useDebounce — delays updating a value until the user stops changing it.
 *
 * Why this exists:
 * When a user types in a search box, you don't want to fire an API call
 * on every single keystroke. Debouncing waits until the user pauses
 * before triggering the action.
 *
 * Example:
 * User types "Google" → 6 characters → without debounce: 6 API calls
 *                                     → with debounce (400ms): 1 API call
 *
 * @param value - The value to debounce
 * @param delay - Milliseconds to wait (400ms is a good default for search)
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup: cancel the timeout if value changes before delay expires
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}