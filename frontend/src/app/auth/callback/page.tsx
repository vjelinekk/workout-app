'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { exchangeGoogleAuthCode } from '@/api/services/auth';
import { AUTH_MESSAGE_TYPES } from '@/constants/authMessages';
import axios from 'axios';
import { ApiErrorResponse } from '@/types/api';

export default function AuthCallback() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'error'>('loading');

    useEffect(() => {
        const exchangeCode = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');

            const opener = window.opener as (Window & typeof globalThis) | null;

            if (error) {
                setStatus('error');
                if (opener) {
                    opener.postMessage(
                        {
                            type: AUTH_MESSAGE_TYPES.GOOGLE_LOGIN_ERROR,
                            error,
                        },
                        window.location.origin,
                    );
                }

                // Close the popup after showing error message
                setTimeout(() => {
                    window.close();
                }, 1500);
                return;
            }

            if (code && opener) {
                try {
                    // Exchange the code for actual tokens via secure POST request
                    const loginResponse = await exchangeGoogleAuthCode(code);

                    // Send the response to the parent window
                    opener.postMessage(
                        {
                            type: AUTH_MESSAGE_TYPES.GOOGLE_LOGIN_SUCCESS,
                            payload: loginResponse,
                        },
                        window.location.origin,
                    );
                } catch (err: unknown) {
                    setStatus('error');

                    let errorMessage = 'Failed to complete authentication';
                    if (axios.isAxiosError<ApiErrorResponse>(err)) {
                        if (err.response?.data?.message?.message) {
                            errorMessage = Array.isArray(
                                err.response.data.message.message,
                            )
                                ? err.response.data.message.message.join(', ')
                                : err.response.data.message.message;
                        }
                    }

                    opener.postMessage(
                        {
                            type: AUTH_MESSAGE_TYPES.GOOGLE_LOGIN_ERROR,
                            error: errorMessage,
                        },
                        window.location.origin,
                    );

                    // Close the popup after showing error message
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                }
            } else {
                setStatus('error');
                // Close after 3 seconds if no opener or no code
                setTimeout(() => {
                    window.close();
                }, 3000);
            }
        };

        void exchangeCode();
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                {status === 'loading' ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold mb-2">
                            Processing login...
                        </h2>
                        <p className="text-gray-600">
                            Please wait while we complete your authentication.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="text-red-500 text-5xl mb-4">✗</div>
                        <h2 className="text-xl font-semibold mb-2">
                            Login failed
                        </h2>
                        <p className="text-gray-600">
                            Please close this window and try again.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
