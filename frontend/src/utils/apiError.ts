/**
 * Custom error class for API errors
 *
 * Errors are automatically transformed to ApiError by the axios response interceptor,
 * so this class is used to represent all API errors consistently throughout the app.
 *
 * @example
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(`API Error ${error.statusCode}: ${error.message}`);
 *   }
 * }
 */
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