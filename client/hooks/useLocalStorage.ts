import { useEffect, useState } from "react";

/**
 * useLocalStorage — safe localStorage hook.
 *
 * Problems this solves:
 * 1. Next.js runs on the server where localStorage doesn't exist.
 *    Direct localStorage access throws "localStorage is not defined".
 *    This hook handles SSR safely.
 *
 * 2. JSON parse errors from corrupted storage silently fail.
 *    This hook catches them and returns the default value.
 *
 * 3. Keeps React state in sync with localStorage changes.
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T) => void, () => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        // SSR guard: localStorage doesn't exist on the server
        if (typeof window === "undefined") return initialValue;

        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            // If parsing fails, return the default
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            setStoredValue(value);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (err) {
            console.error(`useLocalStorage: Failed to set key "${key}"`, err);
        }
    };

    const removeValue = () => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== "undefined") {
                window.localStorage.removeItem(key);
            }
        } catch (err) {
            console.error(`useLocalStorage: Failed to remove key "${key}"`, err);
        }
    };

    return [storedValue, setValue, removeValue];
}