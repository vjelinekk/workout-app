'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LoginForm } from '@/components/Auth/LoginForm';
import { GoogleLoginButton } from '@/components/Auth/GoogleLoginButton';
import { AuthLayout } from '@/components/Auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

export default function LoginPage() {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.loginPage);
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleRegister = () => {
        router.push('/register');
    };

    return (
        <AuthLayout title={t('title')} description={t('description')}>
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <LoginForm setError={setError} />

            <div className="text-center text-sm text-muted-foreground">
                <span className="block sm:inline">{t('noAccount')}</span>{' '}
                <Button variant="link" onClick={handleRegister}>
                    {t('register')}
                </Button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        {t('continueWithGoogle')}
                    </span>
                </div>
            </div>

            <GoogleLoginButton />
        </AuthLayout>
    );
}
