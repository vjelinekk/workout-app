import { DarkModeToggle } from '@/components/DarkModeToggle/DarkModeToggle';
import './globals.css';
import Providers from './providers';

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
                    <header className="flex justify-end p-4">
                        <DarkModeToggle />
                    </header>

                    {/* Page content */}
                    <main className="pt-8 px-4">{children}</main>
                </Providers>
            </body>
        </html>
    );
}
