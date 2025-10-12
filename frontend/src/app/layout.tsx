import { cookies } from 'next/headers';
import './globals.css';
import Providers from './providers';
import { TopBar } from '@/components/TopBar/TopBar';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = (await cookies()).get('locale')?.value || 'en';
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className="bg-background text-foreground">
                <Providers locale={locale} messages={messages}>
                    {/* Top bar */}
                    <TopBar />

                    {/* Page content */}
                    <main className="pt-8 px-4">{children}</main>
                </Providers>
            </body>
        </html>
    );
}
