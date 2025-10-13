export interface ApiErrorResponse {
    message: {
        message: string | string[];
        error: string;
        statusCode: number;
    }
}