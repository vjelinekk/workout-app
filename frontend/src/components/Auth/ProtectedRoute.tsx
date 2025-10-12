'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
}

const LOADING_TIMEOUT_MS = 5000;

export const ProtectedRoute = ({ children, requiredRoles }: Props) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                setLoadingTimeout(true);
            }
        }, LOADING_TIMEOUT_MS);

        return () => clearTimeout(timeout);
    }, [isLoading]);

    useEffect(() => {
        if (!isLoading && isAuthenticated && requiredRoles && user) {
            const hasRequiredRole = user.roles.some((role) =>
                requiredRoles.includes(role),
            );

            if (!hasRequiredRole) {
                router.push('/unauthorized');
            }
        }
    }, [isAuthenticated, isLoading, user, requiredRoles, router]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading && !loadingTimeout) {
        return <div>Loading...</div>;
    }

    if (loadingTimeout) {
        return (
            <div>
                Something went wrong.{' '}
                <button onClick={() => window.location.reload()}>
                    Refresh
                </button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};
