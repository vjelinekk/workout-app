'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormValues, loginSchema } from '@/schemas/login';
import { BasicInputField } from '../BasicForm/BasicInputField';
import { BasicForm } from '../BasicForm/BasicForm';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { ApiError } from '@/utils/apiError';

interface Props {
    setError: Dispatch<SetStateAction<string>>;
}

export const LoginForm = ({ setError }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.loginPage);
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
            if (err instanceof ApiError) {
                setError(err.message);
                return;
            }

            setError(t('unexpectedError'));
        }
    };

    return (
        <BasicForm<LoginFormValues>
            form={form}
            onSubmit={(data) => void onSubmit(data)}
            submitLabel={t('signIn')}
            submittingLabel={t('signingIn')}
        >
            <BasicInputField<LoginFormValues>
                name="email"
                label={t('email')}
                required
                placeholder="user@example.com"
                autoComplete="email"
                control={form.control}
            />

            <BasicInputField<LoginFormValues>
                name="password"
                label={t('password')}
                required
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                control={form.control}
            />
        </BasicForm>
    );
};
