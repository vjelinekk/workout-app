'use client';

import { api } from "@/api/axios";
import { AUTH_ENDPOINTS } from "@/api/endpoints/auth";
import { login, logout } from "@/api/services/auth";
import { AUTH_MESSAGE_TYPES } from "@/constants/authMessages";
import { AuthState, LoginCredentials, User, LoginResponse } from "@/types/auth";
import { storage } from "@/utils/storage";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    exp: number;
}

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    loginWithGoogle: () => void;
    isGoogleLoading: boolean;
    signUp: (data: LoginResponse) => Promise<void>;
    googleLoginError: string | null;
    clearGoogleLoginError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authData, setAuthData] = useState<{ user: User | null; token: string | null }>({ user: null, token: null });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
    const [googleLoginError, setGoogleLoginError] = useState<string | null>(null);
    const router = useRouter();

    // Flag to prevent race conditions in 401 interceptor
    // Ensures logout only happens once even if multiple requests fail simultaneously
    const isLoggingOutRef = useRef<boolean>(false);
    
    // Counter for consecutive 401 errors
    const unauthorized401CountRef = useRef<number>(0);

    const handleLogout = useCallback(() => {
        // Prevent multiple concurrent logouts (race condition)
        if (isLoggingOutRef.current) {
            return;
        }
        isLoggingOutRef.current = true;

        // Clear local state first
        setAuthData({ user: null, token: null });
        
        // Clear storage
        logout();
        
        // Reset the logout flag after a brief delay to prevent race conditions
        // but allow future logout calls if needed
        setTimeout(() => {
            isLoggingOutRef.current = false;
        }, 1000);
        
        // Navigate to login page
        router.push('/login');
    }, [router]);

    useEffect(() => {
        const storedToken = storage.getToken();
        const storedUser = storage.getUser();

        if (storedToken && storedUser) {
            try {
                const decoded = jwtDecode<JwtPayload>(storedToken);
                const currentTime = Date.now() / 1000; // Convert to seconds
                
                if (decoded.exp && decoded.exp < currentTime) {
                    // Token has expired
                    handleLogout();
                } else {
                    setAuthData({ user: storedUser, token: storedToken });
                }
            } catch (error) {
                // Invalid token format
                handleLogout();
            }
        }

        setIsLoading(false);
    }, [handleLogout]);

    useEffect(() => {
        // Setup response interceptor to handle 401 (unauthorized) errors
        // This interceptor is added AFTER the axios.ts interceptor, so it runs BEFORE
        // the error transformation in the error chain (interceptors run in reverse for errors)
        const interceptor = api.interceptors.response.use(
            response => {
                // Reset counter on successful response
                unauthorized401CountRef.current = 0;
                return response;
            },
            error => {
                // Check for 401 status
                // The error may already be transformed to ApiError by axios.ts interceptor
                const status = error.response?.status || error.statusCode;
                
                if (status === 401) {
                    unauthorized401CountRef.current += 1;
                    
                    // Log out after 3 consecutive 401 errors
                    if (unauthorized401CountRef.current >= 3) {
                        unauthorized401CountRef.current = 0;
                        handleLogout();
                    }
                }
                return Promise.reject(error);
            }
        )

        return () => {
            api.interceptors.response.eject(interceptor);
        }
    }, [handleLogout])

    const handleLogin = async (credentials: LoginCredentials) => {
        const { token, user } = await login(credentials);

        storage.setToken(token);
        storage.setUser(user);

        setAuthData({ user, token });

        router.push('/dashboard');
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

    const clearGoogleLoginError = useCallback(() => {
        setGoogleLoginError(null);
    }, []);

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
                popup.close();
                setIsGoogleLoading(false);

                // Store error message for display on login page
                const errorMessage = event.data.error || 'unknown_error';
                setGoogleLoginError(errorMessage);
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
        googleLoginError,
        clearGoogleLoginError,
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