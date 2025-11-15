import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from './components/ErrorBoundary';
import { SessionProvider } from './providers/SessionProvider';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'SuperLocalizer',
    description: 'Localization management dashboard',
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ErrorBoundary>
                    <SessionProvider>
                        <AuthProvider>
                            <NavBar />
                            {children}
                        </AuthProvider>
                    </SessionProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}