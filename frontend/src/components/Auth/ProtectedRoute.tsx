'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '../ui/icons/spinner';

interface Props {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
}

const LOADING_TIMEOUT_MS = 5000;

export const ProtectedRoute = ({ children, requiredRoles }: Props) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();

    // Wait for hydration to complete before using router or rendering children
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                setLoadingTimeout(true);
            }
        }, LOADING_TIMEOUT_MS);

        return () => clearTimeout(timeout);
    }, [isLoading]);

    useEffect(() => {
        if (
            !isLoading &&
            isAuthenticated &&
            requiredRoles &&
            user &&
            isHydrated
        ) {
            const hasRequiredRole = user.roles.some((role) =>
                requiredRoles.includes(role),
            );

            if (!hasRequiredRole) {
                router.push('/unauthorized');
            }
        }
    }, [isAuthenticated, isLoading, user, requiredRoles, router, isHydrated]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && isHydrated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router, isHydrated]);

    // Show spinner while loading authentication or waiting for hydration
    if ((isLoading || !isHydrated) && !loadingTimeout) {
        return <Spinner />;
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

    // Only render children after hydration is complete
    if (!isHydrated) {
        return null;
    }

    return <>{children}</>;
};
