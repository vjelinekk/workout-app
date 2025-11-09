import { LOCAL_STORAGE_KEYS } from "@/constants/localStorage";
import { User } from "@/types/auth";

/**
 * Centralized localStorage wrapper with error handling
 *
 * Handles:
 * - Private browsing mode (Safari, Firefox throw SecurityError)
 * - Storage quota exceeded (throws QuotaExceededError)
 * - Cross-origin iframe restrictions
 * - SSR safety (window is undefined)
 */
export const storage = {
    // Generic helpers
    get: (key: string): string | null => {
        if (typeof window === 'undefined') return null; // SSR safety
        try {
            return localStorage.getItem(key);
        } catch (error) {
            // SecurityError: private browsing, blocked by settings
            // QuotaExceededError: storage limit reached
            console.warn(`[Storage] Failed to read key "${key}":`, error);
            return null;
        }
    },

    set: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // SecurityError: private browsing, blocked by settings
            // QuotaExceededError: storage limit reached
            console.warn(`[Storage] Failed to write key "${key}":`, error);
            // Graceful degradation: fail silently, app continues without persistence
        }
    },

    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            // SecurityError: private browsing, blocked by settings
            console.warn(`[Storage] Failed to remove key "${key}":`, error);
            // Graceful degradation: fail silently
        }
    },

    // JSON helpers
    getJSON: <T>(key: string): T | null => {
        const data = storage.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch (error) {
            // Invalid JSON stored in localStorage
            console.warn(`[Storage] Failed to parse JSON for key "${key}":`, error);
            return null;
        }
    },

    setJSON: <T>(key: string, value: T): void => {
        try {
            storage.set(key, JSON.stringify(value));
        } catch (error) {
            // JSON.stringify failure (circular references, etc.)
            console.warn(`[Storage] Failed to stringify value for key "${key}":`, error);
        }
    },

    // Auth-specific helpers
    getToken: (): string | null => {
        return storage.get(LOCAL_STORAGE_KEYS.authToken);
    },

    setToken: (token: string): void => {
        storage.set(LOCAL_STORAGE_KEYS.authToken, token);
    },

    removeToken: (): void => {
        storage.remove(LOCAL_STORAGE_KEYS.authToken);
    },

    getUser: (): User | null => {
        return storage.getJSON<User>(LOCAL_STORAGE_KEYS.authUser);
    },

    setUser: (user: User): void => {
        storage.setJSON(LOCAL_STORAGE_KEYS.authUser, user);
    },

    removeUser: (): void => {
        storage.remove(LOCAL_STORAGE_KEYS.authUser);
    },

    // Clear all auth data
    clearAuth: (): void => {
        storage.removeToken();
        storage.removeUser();
    },
};