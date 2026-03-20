import { useState } from "react";
// ✅ Fixed: removed unused `useEffect` import

/**
 * useLocalStorage — safe localStorage hook with SSR support.
 *
 * Problems this solves:
 * 1. Next.js runs on the server where localStorage doesn't exist.
 *    Direct access throws "localStorage is not defined" during SSR.
 * 2. JSON parse errors from corrupted storage crash silently.
 *    This hook catches them and returns the default value.
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