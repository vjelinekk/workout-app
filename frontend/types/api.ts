export interface ApiErrorResponse {
    message: {
        message: string;
        error: string;
        statusCode: number;
    }
}