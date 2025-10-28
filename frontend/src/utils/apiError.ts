import { ApiErrorResponse } from "@/types/api";
import axios from "axios";

export class ApiError extends Error {
    constructor(
        public message: string,
        public statusCode?: number,
        public errorCode?: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function handleApiError(error: unknown, defaultMessage: string): never {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const message = error.response?.data?.message?.message;
        const statusCode = error.response?.status;
        const errorCode = error.response?.data?.message?.error;

        const errorMessage = Array.isArray(message)
            ? message.join(' ')
            : message || defaultMessage;

        throw new ApiError(errorMessage, statusCode, errorCode, error);
    }

    throw new ApiError(defaultMessage, undefined, undefined, error);
}