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
            <body>
                <Providers>
                    <DarkModeToggle />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
