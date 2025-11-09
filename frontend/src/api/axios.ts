import { TIMEOUT_MS } from '@/constants/axios';
import { storage } from '@/utils/storage';
import { ApiError } from '@/utils/apiError';
import axios from 'axios';
import { ApiErrorResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

export const api = axios.create({
    baseURL: API_URL,
    timeout: TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - adds authorization token
api.interceptors.request.use(
    (config) => {
        const token = storage.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor - transforms all errors to ApiError for consistent handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle axios errors (HTTP requests that completed with error status)
        if (axios.isAxiosError<ApiErrorResponse>(error)) {
            const message = error.response?.data?.message?.message;
            const statusCode = error.response?.status;
            const errorCode = error.response?.data?.message?.error;

            // Extract error message from response or use default
            const errorMessage = Array.isArray(message)
                ? message.join(' ')
                : message || 'An unexpected error occurred';

            // Transform to ApiError for consistent handling across the app
            return Promise.reject(new ApiError(errorMessage, statusCode, errorCode, error));
        }

        // Handle non-axios errors (network timeouts, parse errors, etc.)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return Promise.reject(new ApiError(errorMessage, undefined, undefined, error));
    }
);