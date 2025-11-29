import fs from 'fs';
import path from 'path';
import { NextIntlClientProvider } from 'next-intl';
import ErrorBoundary from '../components/ErrorBoundary';
import { SessionProvider } from '../providers/SessionProvider';
import { AuthProvider } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: { locale: string };
}

export async function generateStaticParams() {
    // Try multiple possible locations for the localization folder depending on
    // how the frontend is started (repo root or inside `frontend` folder).
    const candidates = [
        path.join(process.cwd(), 'frontend', 'localization'),
        path.join(process.cwd(), 'localization')
    ];
    const defaultMessagesDir: string = path.join(process.cwd(), 'frontend', 'localization');
    let messagesDir: string = defaultMessagesDir;
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            messagesDir = p;
            break;
        }
    }
    try {
        const entries = await fs.promises.readdir(messagesDir, { withFileTypes: true });
        return entries
            .filter((e: fs.Dirent) => e.isFile() && e.name.endsWith('.json'))
            .map((f: fs.Dirent) => ({ locale: path.basename(f.name, '.json') }));
    } catch (e) {
        return [{ locale: 'en' }];
    }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = params;
    // Look for messages in a localization folder. Depending on how dev tooling
    // is started, the working directory can be the repo root or the frontend
    // folder. Try a few likely locations and pick the first that exists.
    const candidates = [
        path.join(process.cwd(), 'frontend', 'localization'),
        path.join(process.cwd(), 'localization')
    ];
    const defaultMessagesDir: string = path.join(process.cwd(), 'frontend', 'localization');
    let messagesDir: string = defaultMessagesDir;
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            messagesDir = p;
            break;
        }
    }
    const messagesPath = path.join(messagesDir, `${locale}.json`);

    let messages = {};
    try {
        const cwd = process.cwd();
        console.debug('[i18n] cwd:', cwd);
        console.debug('[i18n] localization candidates:', candidates);
        console.debug('[i18n] chosen messagesDir:', messagesDir);
        const fileExists = fs.existsSync(messagesPath);
        console.debug(`[i18n] messagesPath=${messagesPath} exists=${fileExists}`);
        if (fileExists) {
            const stat = await fs.promises.stat(messagesPath);
            console.debug(`[i18n] messages file size=${stat.size} bytes`);
            const raw = await fs.promises.readFile(messagesPath, 'utf-8');
            console.debug(`[i18n] raw messages length=${raw.length}`);
            console.debug(`[i18n] raw preview: ${raw.slice(0, 500)}`);
            messages = JSON.parse(raw || '{}');
        } else {
            messages = {};
        }
    } catch (err) {
        // If messages fail to load, fall back to frontend/localization/en.json
        try {
            const fallback = await fs.promises.readFile(
                path.join(process.cwd(), 'frontend', 'localization', 'en.json'),
                'utf-8'
            );
            messages = JSON.parse(fallback || '{}');
        } catch (e) {
            messages = {};
        }
    }

    // Diagnostic logging: show top-level keys loaded and warn if 'dashboard' namespace missing
    try {
        const topKeys = Object.keys(messages);
        console.debug(`[i18n] loaded message keys for locale=${locale}:`, topKeys);
        if (!topKeys.includes('dashboard')) {
            console.warn(`[i18n] 'dashboard' key not found in messages for locale=${locale}`);
        }
    } catch (e) {
        console.error('[i18n] failed to inspect messages object:', e);
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
                                <Footer />
                            </AuthProvider>
                        </SessionProvider>
                    </NextIntlClientProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
