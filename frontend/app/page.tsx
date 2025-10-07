'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state while checking authentication
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
}
