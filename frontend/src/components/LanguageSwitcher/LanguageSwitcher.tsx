'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { readLocaleFromCookie, setLocaleCookie } from '@/utils/localeCookies';
import { AVAILABLE_LOCALES } from '@/constants/locale';
import { useRouter } from 'next/navigation';

export const LanguageSwitcher = () => {
    const [locale, setLocale] = useState('en'); // default
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // read cookie after mount
    useEffect(() => {
        const cookieLocale = readLocaleFromCookie();
        if (cookieLocale) setLocale(cookieLocale);
        setMounted(true);
    }, []);

    const handleChange = () => {
        const nextLocale = locale === 'en' ? 'cs' : 'en'; // simple toggle
        setLocale(nextLocale);
        setLocaleCookie(nextLocale);
        router.refresh(); // re-render server components
    };

    if (!mounted) return null; // prevent hydration mismatch

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleChange}
            title={`Switch language (current: ${locale})`}
        >
            <Globe className="h-[1.2rem] w-[1.2rem]" />
            <span className="ml-1">
                {AVAILABLE_LOCALES.find((l) => l.code === locale)?.label ??
                    locale.toUpperCase()}
            </span>
        </Button>
    );
};
