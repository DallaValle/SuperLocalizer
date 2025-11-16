import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async (params: any) => {
    const request = params?.request;

    // Support both NextRequest (has nextUrl) and standard Request (has url)
    const pathname = request?.nextUrl?.pathname ?? (typeof request?.url === 'string' ? new URL(request.url).pathname : undefined);

    // Extract locale from path like '/en/...' -> 'en'
    let locale = typeof pathname === 'string' ? pathname.split('/')[1] : undefined;

    // Fallback to 'en' if we couldn't determine locale
    if (!locale) locale = 'en';

    // Try to load messages; if the file doesn't exist, fall back to English messages
    try {
        return {
            locale,
            messages: (await import(`../localization/${locale}.json`)).default
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Localization for '${locale}' not found, falling back to 'en'`);
        return {
            locale: 'en',
            messages: (await import(`../localization/en.json`)).default
        };
    }
});