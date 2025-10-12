'use client';

import { api } from "@/api/axios";
import { AUTH_ENDPOINTS } from "@/api/endpoints/auth";
import { login, logout } from "@/api/services/auth";
import { AUTH_HEADER_KEY } from "@/constants/api";
import { AUTH_MESSAGE_TYPES } from "@/constants/authMessages";
import { AuthState, LoginCredentials, User, LoginResponse } from "@/types/auth";
import { storage } from "@/utils/storage";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    loginWithGoogle: () => void;
    isGoogleLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const storedToken = storage.getToken();
        const storedUser = storage.getUser();

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);
            api.defaults.headers.common[AUTH_HEADER_KEY] = `Bearer ${storedToken}`;
        }

        setIsLoading(false);
    }, [])


    const handleLogout = useCallback(() => {
        setUser(null);
        setToken(null);
        logout();
        router.push('/login');
    }, [router]);

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            response => response,
            error => {
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

            setToken(token);
            setUser(user);
            api.defaults.headers.common[AUTH_HEADER_KEY] = `Bearer ${token}`;
            router.push('/dashboard');
        } catch (error) {
            throw error;
        }
    }

    const handleGoogleLoginSuccess = useCallback(async (response: LoginResponse) => {
        const token = response.access_token;
        const user: User = {
            id: response.user_id,
            firstName: response.user_first_name,
            lastName: response.user_last_name,
            nickname: response.user_nickname,
            email: response.user_email,
            roles: response.roles,
        };

        storage.setToken(token);
        storage.setUser(user);

        setToken(token);
        setUser(user);
        api.defaults.headers.common[AUTH_HEADER_KEY] = `Bearer ${token}`;
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
            console.error('Backend URL is not defined');
            setIsGoogleLoading(false);
            return;
        }

        const popup = window.open(
            `${backendUrl}${AUTH_ENDPOINTS.google}`,
            'Google Login',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (!popup) {
            console.error('Failed to open popup window');
            setIsGoogleLoading(false);
            return;
        }

        // Listen for messages from the popup
        const handleMessage = (event: MessageEvent) => {
            // Verify the origin for security
            if (event.origin !== window.location.origin) {
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
                console.error('Google login error:', event.data.error);
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
    }, [handleGoogleLoginSuccess]);

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isGoogleLoading,
        login: handleLogin,
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