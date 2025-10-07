/**
 * Constants for authentication message types used in postMessage communication
 * between popup window and parent window during Google OAuth flow
 */
export const AUTH_MESSAGE_TYPES = {
    GOOGLE_LOGIN_SUCCESS: 'GOOGLE_LOGIN_SUCCESS',
    GOOGLE_LOGIN_ERROR: 'GOOGLE_LOGIN_ERROR',
} as const;

export type AuthMessageType = typeof AUTH_MESSAGE_TYPES[keyof typeof AUTH_MESSAGE_TYPES];

import { LoginResponse } from '@/types/auth';

/**
 * Type definitions for auth messages
 */
export interface GoogleLoginSuccessMessage {
    type: typeof AUTH_MESSAGE_TYPES.GOOGLE_LOGIN_SUCCESS;
    payload: LoginResponse;
}

export interface GoogleLoginErrorMessage {
    type: typeof AUTH_MESSAGE_TYPES.GOOGLE_LOGIN_ERROR;
    error: string;
}

export type AuthMessage = GoogleLoginSuccessMessage | GoogleLoginErrorMessage;
