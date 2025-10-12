import { LOCAL_STORAGE_KEYS } from "@/constants/localStorage";
import { User } from "@/types/auth";

export const storage = {
    // Generic helpers
    get: (key: string): string | null => {
        if (typeof window === 'undefined') return null; // SSR safety
        return localStorage.getItem(key);
    },

    set: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, value);
    },

    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },

    // JSON helpers
    getJSON: <T>(key: string): T | null => {
        const data = storage.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch {
            return null;
        }
    },

    setJSON: <T>(key: string, value: T): void => {
        storage.set(key, JSON.stringify(value));
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