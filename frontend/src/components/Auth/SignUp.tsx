'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthLayout } from './AuthLayout';
import { SignUpForm } from './SignUpForm';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import { useTranslations } from 'next-intl';

export const SignUp = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.registerPage);
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    return (
        <AuthLayout title={t('title')} description={t('description')}>
            <SignUpForm />
        </AuthLayout>
    );
};
