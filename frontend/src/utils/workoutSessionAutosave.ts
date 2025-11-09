import { SessionLoggingData } from "@/types/workoutSession";

/**
 * Helper to safely get item from localStorage
 * Returns null if storage is unavailable (private browsing, quota exceeded, etc.)
 */
export const getDraftFromStorage = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`[Autosave] Failed to read draft from localStorage:`, error);
        return null;
    }
};

/**
 * Helper to safely set item in localStorage
 * Gracefully handles errors (private browsing, quota exceeded, etc.)
 */
export const saveDraftToStorage = (key: string, data: SessionLoggingData): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn(`[Autosave] Failed to save draft to localStorage:`, error);
        // App continues without localStorage persistence - user data still in memory
    }
};

/**
 * Helper to safely remove item from localStorage
 */
export const removeDraftFromStorage = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`[Autosave] Failed to remove draft from localStorage:`, error);
        // Graceful degradation - not critical
    }
};