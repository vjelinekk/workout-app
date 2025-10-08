'use client';

import { AuthLayout } from '@/components/Auth/AuthLayout';
import { RegisterForm } from '@/components/Auth/RegisterForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RegisterPage() {
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    });

    return (
        <AuthLayout
            title="Create an account"
            description="Sign up to get started."
        >
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Registration form will go here */}
            <RegisterForm setError={setError} />
        </AuthLayout>
    );
}
