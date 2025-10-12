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
import { useTranslations } from 'next-intl';
import { SECTION_KEYS } from '@/constants/locale';

interface Props {
    setError: Dispatch<SetStateAction<string>>;
}

export const LoginForm = ({ setError }: Props) => {
    const t = useTranslations(SECTION_KEYS.loginPage);
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
                    err.response?.data?.message?.message || t('loginFailed'),
                );
            } else {
                setError(t('unexpectedError'));
            }
        }
    };

    return (
        <AuthForm<LoginFormValues>
            form={form}
            onSubmit={onSubmit}
            submitLabel={t('signIn')}
            submittingLabel={t('signingIn')}
        >
            <AuthInputField<LoginFormValues>
                name="email"
                label={t('email')}
                placeholder="user@example.com"
                autoComplete="email"
                control={form.control}
            />

            <AuthInputField<LoginFormValues>
                name="password"
                label={t('password')}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                control={form.control}
            />
        </AuthForm>
    );
};
