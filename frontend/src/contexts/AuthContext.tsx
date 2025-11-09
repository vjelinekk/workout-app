'use client';

import { api } from "@/api/axios";
import { AUTH_ENDPOINTS } from "@/api/endpoints/auth";
import { login, logout } from "@/api/services/auth";
import { AUTH_MESSAGE_TYPES } from "@/constants/authMessages";
import { AuthState, LoginCredentials, User, LoginResponse } from "@/types/auth";
import { storage } from "@/utils/storage";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    loginWithGoogle: () => void;
    isGoogleLoading: boolean;
    signUp: (data: LoginResponse) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authData, setAuthData] = useState<{ user: User | null; token: string | null }>({ user: null, token: null });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
    const router = useRouter();

    // Flag to prevent race conditions in 401 interceptor
    // Ensures logout only happens once even if multiple requests fail simultaneously
    const isLoggingOutRef = useRef<boolean>(false);

    useEffect(() => {
        const storedToken = storage.getToken();
        const storedUser = storage.getUser();

        if (storedToken && storedUser) {
            setAuthData({ user: storedUser, token: storedToken });

        }

        setIsLoading(false);
    }, [setAuthData, setIsLoading])


    const handleLogout = useCallback(() => {
        // Prevent multiple concurrent logouts (race condition)
        if (isLoggingOutRef.current) {
            return;
        }
        isLoggingOutRef.current = true;

        setAuthData({ user: null, token: null });
        logout();
        router.push('/login');
    }, [router]);

    useEffect(() => {
        // Setup response interceptor to handle 401 (unauthorized) errors
        // The handleLogout function includes a guard to prevent race conditions
        const interceptor = api.interceptors.response.use(
            response => response,
            error => {
                // When token expires, backend returns 401
                // handleLogout will only execute once due to isLoggingOutRef guard
                if (error.response?.status === 401) {
                    handleLogout();
                }
                return Promise.reject(error);
            }
        )

        return () => {
            api.interceptors.response.eject(interceptor);
        }
    }, [handleLogout])

    const handleLogin = async (credentials: LoginCredentials) => {
        try {
            const { token, user } = await login(credentials);

            storage.setToken(token);
            storage.setUser(user);

            setAuthData({ user, token });

            router.push('/dashboard');
        } catch (error) {
            throw error;
        }
    }

    const handleSignUp = async (data: LoginResponse) => {
        storage.setToken(data.accessToken);
        const user: User = {
            id: data.userId,
            firstName: data.userFirstName,
            lastName: data.userLastName,
            nickname: data.userNickname,
            email: data.userEmail,
            roles: data.roles,
        };
        storage.setUser(user);

        setAuthData({ user, token: data.accessToken });

        router.push('/dashboard');
    }

    const handleGoogleLoginSuccess = useCallback(async (response: LoginResponse) => {
        const token = response.accessToken;
        const user: User = {
            id: response.userId,
            firstName: response.userFirstName,
            lastName: response.userLastName,
            nickname: response.userNickname,
            email: response.userEmail,
            roles: response.roles,
        };

        storage.setToken(token);
        storage.setUser(user);

        setAuthData({ user, token });

        setIsGoogleLoading(false);
        router.push('/dashboard');
    }, [router]);

    const handleLoginWithGoogle = useCallback(() => {
        setIsGoogleLoading(true);

        // Center the popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        // Open popup window
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!backendUrl) {
            setIsGoogleLoading(false);
            return;
        }

        const popup = window.open(
            `${backendUrl}${AUTH_ENDPOINTS.google}`,
            'Google Login',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (!popup) {
            setIsGoogleLoading(false);
            return;
        }

        // Whitelist of allowed origins for postMessage security
        // Includes both frontend and backend origins
        const allowedOrigins = [
            window.location.origin,  // Frontend: http://localhost:3000 or https://app.example.com
            backendUrl,              // Backend: http://localhost:3001 or https://api.example.com
        ];

        // Listen for messages from the popup
        const handleMessage = (event: MessageEvent) => {
            // Verify the origin for security - only accept from whitelisted origins
            if (!allowedOrigins.includes(event.origin)) {
                console.warn('[Auth] Rejected postMessage from unauthorized origin:', event.origin);
                return;
            }

            if (event.data.type === AUTH_MESSAGE_TYPES.GOOGLE_LOGIN_SUCCESS) {
                window.removeEventListener('message', handleMessage);
                popup.close();
                handleGoogleLoginSuccess(event.data.payload);
            } else if (event.data.type === AUTH_MESSAGE_TYPES.GOOGLE_LOGIN_ERROR) {
                window.removeEventListener('message', handleMessage);
                // Don't close popup on error - let it show the error message
                setIsGoogleLoading(false);
            }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was closed manually
        const popupCheckInterval = setInterval(() => {
            if (popup.closed) {
                clearInterval(popupCheckInterval);
                window.removeEventListener('message', handleMessage);
                setIsGoogleLoading(false);
            }
        }, 500);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearInterval(popupCheckInterval);
        }
    }, [handleGoogleLoginSuccess]);

    const value: AuthContextType = {
        user: authData.user,
        token: authData.token,
        isAuthenticated: !!authData.user && !!authData.token,
        isLoading,
        isGoogleLoading,
        login: handleLogin,
        signUp: handleSignUp,
        logout: handleLogout,
        loginWithGoogle: handleLoginWithGoogle,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}