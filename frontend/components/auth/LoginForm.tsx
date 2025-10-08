'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { ApiErrorResponse } from '@/types/api';
import { LoginFormValues, loginSchema } from '@/schemas/login';
import { AuthInputField } from './AuthInputField';
import { AuthForm } from './AuthForm';

interface Props {
    setError: Dispatch<SetStateAction<string>>;
}

export const LoginForm = ({ setError }: Props) => {
    const { login } = useAuth();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setError(''); // Clear previous errors
        try {
            await login(data);
        } catch (err: unknown) {
            if (axios.isAxiosError<ApiErrorResponse>(err)) {
                setError(
                    err.response?.data?.message?.message ||
                        'Login failed. Please check your credentials.',
                );
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <AuthForm<LoginFormValues>
            form={form}
            onSubmit={onSubmit}
            submitLabel="Sign in"
            submittingLabel="Signing in..."
        >
            <AuthInputField<LoginFormValues>
                name="email"
                label="Email"
                placeholder="user@example.com"
                autoComplete="email"
                control={form.control}
            />

            <AuthInputField<LoginFormValues>
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                control={form.control}
            />
        </AuthForm>
    );
};
