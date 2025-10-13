'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/navigation';
import { readLocaleFromCookie } from '@/utils/localeCookies';

export default function Providers({
    children,
    locale,
    messages,
}: {
    children: React.ReactNode;
    locale: string;
    messages: Record<string, string>;
}) {
    const [queryClient] = useState(() => new QueryClient());
    const router = useRouter();

    // If user changes locale (cookie) on another page and then uses
    // browser back/forward navigation, Next may restore a cached page with
    // the old locale. Listen for popstate and refresh server rendering
    // when the cookie locale differs from the provider locale so messages
    // are reloaded server-side. Debounce refresh calls to avoid repeated
    // router.refresh() when user clicks back/forward rapidly.
    useEffect(() => {
        const debounceRef = { current: null as number | null };

        const handlePopState = () => {
            try {
                const cookieLocale = readLocaleFromCookie() || 'en';
                if (cookieLocale !== locale) {
                    // debounce refresh by 250ms
                    if (debounceRef.current) {
                        window.clearTimeout(debounceRef.current);
                    }
                    debounceRef.current = window.setTimeout(() => {
                        router.refresh();
                        debounceRef.current = null;
                    }, 250);
                }
            } catch (err) {
                // ignore — best-effort refresh
                void err;
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
            }
        };
    }, [locale, router]);

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </AuthProvider>
            </QueryClientProvider>
        </NextIntlClientProvider>
    );
}
