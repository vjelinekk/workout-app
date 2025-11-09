import { LoginCredentials, LoginResponse, LoginResult } from "@/types/auth";
import { api } from "../axios";
import { AUTH_ENDPOINTS } from "../endpoints/auth";
import { storage } from "@/utils/storage";
import { SignUpFormValues } from "@/schemas/register";

/**
 * Transforms the API login response to a User object.
 * 
 * @param response LoginResponse from the API
 * @returns User object
 */
const transformLoginResponseToUser = (response: LoginResponse) => ({
    id: response.userId,
    firstName: response.userFirstName,
    lastName: response.userLastName,
    nickname: response.userNickname,
    email: response.userEmail,
    roles: response.roles,
});

/**
 * Logs in a user with the provided credentials.
 * Errors are automatically transformed to ApiError by axios interceptor.
 *
 * @param credentials LoginCredentials for the API
 * @returns Promise resolving to LoginResult
 * @throws ApiError if login fails
 */
export const login = async (
    credentials: LoginCredentials
): Promise<LoginResult> => {
    const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.login, credentials);

    return {
        token: response.data.accessToken,
        user: transformLoginResponseToUser(response.data),
    }
}

export const logout = (): void => {
    storage.clearAuth();
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

/**
 * Registers a new user.
 * 
 * @returns Promise resolving to LoginResponse
 */
export const signUp = async (data: SignUpFormValues) => {
    const signUpData = {
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname,
        email: data.email,
        password: data.password,
    }

    const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.signUp, signUpData);
    return response.data;
}