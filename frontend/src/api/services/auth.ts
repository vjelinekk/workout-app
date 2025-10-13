import { LoginCredentials, LoginResponse, LoginResult } from "@/types/auth";
import { api } from "../axios";
import { AUTH_ENDPOINTS } from "../endpoints/auth";
import { storage } from "@/utils/storage";
import { AUTH_HEADER_KEY } from "@/constants/api";
import axios from "axios";
import { ApiErrorResponse } from "@/types/api";
import { handleApiError } from "@/utils/apiError";

/**
 * Transforms the API login response to a User object.
 * 
 * @param response LoginResponse from the API
 * @returns User object
 */
const transformLoginResponseToUser = (response: LoginResponse) => ({
    id: response.user_id,
    firstName: response.user_first_name,
    lastName: response.user_last_name,
    nickname: response.user_nickname,
    email: response.user_email,
    roles: response.roles,
});

/**
 * Logs in a user with the provided credentials.
 * 
 * @param credentials LoginCredentials for the API
 * @returns Promise resolving to LoginResult 
 */
export const login = async (
    credentials: LoginCredentials
): Promise<LoginResult> => {
    try {
        const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.login, credentials);

        return {
            token: response.data.access_token,
            user: transformLoginResponseToUser(response.data),
        }
    } catch (error: unknown) {
        handleApiError(error, 'Login failed');
    }
}

export const logout = (): void => {
    storage.clearAuth();
    delete api.defaults.headers.common[AUTH_HEADER_KEY];
}

/**
 * Exchanges the Google OAuth authorization code for a login token.
 * 
 * @param code Authorization code received from Google OAuth
 * @returns Promise resolving to LoginResponse
 */
export const exchangeGoogleAuthCode = async (code: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.googleExchangeAuthCode, { code });
    return response.data;
}