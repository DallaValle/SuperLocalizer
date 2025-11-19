import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createIntlMiddleware from 'next-intl/middleware';

// -------------------------
// CONFIGURATION
// -------------------------
const LOCALES = ['en', 'it'];
const DEFAULT_LOCALE = 'en';

// Pages that require authentication (without locale prefix)
const PROTECTED_ROUTES = [
    '/dashboard',
    '/properties',
    '/configuration',
    '/settings',
    '/subscriptions'
];

// Pages that authenticated users should not access
const AUTH_PAGES = ['/login', '/signup'];

// -------------------------
// UTILITY FUNCTIONS
// -------------------------
function getLocaleFromPath(pathname: string): string | null {
    const segments = pathname.split('/');
    const potentialLocale = segments[1];
    return potentialLocale && LOCALES.includes(potentialLocale) ? potentialLocale : null;
}

function getPathWithoutLocale(pathname: string): string {
    const segments = pathname.split('/');
    if (segments[1] && LOCALES.includes(segments[1])) {
        return '/' + segments.slice(2).join('/');
    }
    return pathname;
}

function createLocalizedPath(path: string, locale: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/${locale}/${cleanPath}`.replace(/\/+/g, '/').replace(/\/$/, '') || `/${locale}`;
}

// -------------------------
// MAIN MIDDLEWARE
// -------------------------
export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes, static files, and Next.js internals
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Get current locale from path
    const currentLocale = getLocaleFromPath(pathname);
    const pathWithoutLocale = getPathWithoutLocale(pathname);

    // If no locale is detected, redirect to default locale
    if (!currentLocale) {
        const localizedPath = createLocalizedPath(pathname, DEFAULT_LOCALE);
        return NextResponse.redirect(new URL(localizedPath, request.url));
    }

    // Get authentication token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development"
    });

    // Check if user is authenticated
    const isAuthenticated = !!token && (!token.exp || Date.now() < (token.exp as number) * 1000);

    // Check if current path is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/')
    );

    // Check if current path is an auth page
    const isAuthPage = AUTH_PAGES.some(page => pathWithoutLocale === page);

    // Handle protected routes
    if (isProtectedRoute && !isAuthenticated) {
        const loginPath = createLocalizedPath('/login', currentLocale);
        const loginUrl = new URL(loginPath, request.url);
        loginUrl.searchParams.set('redirect', pathname);

        // Clear potentially invalid session cookies
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('next-auth.session-token');
        response.cookies.delete('__Secure-next-auth.session-token');

        return response;
    }

    // Prevent authenticated users from accessing auth pages
    if (isAuthPage && isAuthenticated) {
        const dashboardPath = createLocalizedPath('/dashboard', currentLocale);
        return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Handle root path redirect
    // if (pathWithoutLocale === '' || pathWithoutLocale === '/') {
    //     const redirectPath = isAuthenticated ? '/dashboard' : '/login';
    //     const localizedPath = createLocalizedPath(redirectPath, currentLocale);
    //     return NextResponse.redirect(new URL(localizedPath, request.url));
    // }

    // Create intl middleware for localization
    const intlMiddleware = createIntlMiddleware({
        locales: LOCALES,
        defaultLocale: DEFAULT_LOCALE
    });

    // Apply locale middleware
    return intlMiddleware(request);
}

// -------------------------
// MIDDLEWARE CONFIGURATION
// -------------------------
export const config = {
    matcher: [
        // Match all paths except API routes, static files, and Next.js internals
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
    ]
};