import fs from 'fs';
import path from 'path';
import { NextIntlClientProvider } from 'next-intl';
import ErrorBoundary from '../components/ErrorBoundary';
import { SessionProvider } from '../providers/SessionProvider';
import { AuthProvider } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: { locale: string };
}

export async function generateStaticParams() {
    // Mirror the available locales from the frontend localization folder
    // The folder contains files like `en.json`, `it.json`.
    const messagesDir = path.join(process.cwd(), 'frontend', 'localization');
    try {
        const entries = await fs.promises.readdir(messagesDir, { withFileTypes: true });
        return entries
            .filter((e) => e.isFile() && e.name.endsWith('.json'))
            .map((f) => ({ locale: path.basename(f.name, '.json') }));
    } catch (e) {
        return [{ locale: 'en' }];
    }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = params;
    // Look for messages in frontend/localization/<locale>.json
    const messagesPath = path.join(process.cwd(), 'frontend', 'localization', `${locale}.json`);

    let messages = {};
    try {
        const raw = await fs.promises.readFile(messagesPath, 'utf-8');
        messages = JSON.parse(raw);
    } catch (err) {
        // If messages fail to load, fall back to frontend/localization/en.json
        try {
            const fallback = await fs.promises.readFile(
                path.join(process.cwd(), 'frontend', 'localization', 'en.json'),
                'utf-8'
            );
            messages = JSON.parse(fallback);
        } catch (e) {
            messages = {};
        }
    }

    return (
        <html lang={locale}>
            <body>
                <ErrorBoundary>
                    <NextIntlClientProvider messages={messages} locale={locale}>
                        <SessionProvider>
                            <AuthProvider>
                                <NavBar />
                                {children}
                            </AuthProvider>
                        </SessionProvider>
                    </NextIntlClientProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
