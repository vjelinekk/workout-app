'use client';

import { DarkModeToggle } from '@/components/DarkModeToggle/DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import Link from 'next/dist/client/link';
import { HouseIcon } from 'lucide-react';
import { UserDropDownMenu } from './UserDropDownMenu';

export function TopBar() {
    const { user } = useAuth();

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
                {user && <UserDropDownMenu />}
            </div>
        </header>
    );
}
