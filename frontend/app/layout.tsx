'use client';

import './globals.css';
import Providers from './providers';
import { TopBar } from '@/components/TopBar/TopBar';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-background text-foreground">
                <Providers>
                    {/* Top bar */}
                    <TopBar />

                    {/* Page content */}
                    <main className="pt-8 px-4">{children}</main>
                </Providers>
            </body>
        </html>
    );
}
