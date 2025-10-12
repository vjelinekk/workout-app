'use client';

import { DarkModeToggle } from '@/components/DarkModeToggle/DarkModeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export function TopBar() {
    const t = useTranslations('TopBar');
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="flex justify-end items-center gap-2 p-4 border-b">
            <LanguageSwitcher />
            <DarkModeToggle />
            {user && (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    {t('logout')}
                </Button>
            )}
        </header>
    );
}
