'use client';

import { DarkModeToggle } from '@/components/DarkModeToggle/DarkModeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import Link from 'next/dist/client/link';
import { HouseIcon } from 'lucide-react';

export function TopBar() {
    const t = useTranslations('TopBar');
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="flex justify-between items-center p-4 border-b">
            {/* LEFT SIDE */}
            <div>
                <Link href="/dashboard">
                    <HouseIcon className="inline mr-2" />
                </Link>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <DarkModeToggle />
                {user && (
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        {t('logout')}
                    </Button>
                )}
            </div>
        </header>
    );
}
