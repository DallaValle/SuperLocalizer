import { ProjectService } from './ProjectService';

export interface SupportedLocale {
    code: string;
    name: string;
    flag: string;
}

export class LocaleService {
    private static readonly DEFAULT_LOCALES: SupportedLocale[] = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
        { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'de-CH', name: 'Deutsch (CH)', flag: '🇨🇭' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];

    private static readonly FLAG_MAP: { [key: string]: string } = {
        'en': '🇬🇧',
        'it': '🇮🇹',
        'de-DE': '🇩🇪',
        'de-CH': '🇨🇭',
        'fr': '🇫🇷',
        'es': '🇪🇸',
        'pt': '🇵🇹',
        'ja': '🇯🇵',
        'ko': '🇰🇷',
        'zh': '🇨🇳',
        'ru': '🇷🇺',
        'ar': '🇸🇦',
        'hi': '🇮🇳',
        'tr': '🇹🇷',
        'pl': '🇵🇱',
        'nl': '🇳🇱',
        'sv': '🇸🇪',
        'da': '🇩🇰',
        'no': '🇳🇴',
        'fi': '🇫🇮'
    };

    private static readonly NAME_MAP: { [key: string]: string } = {
        'en': 'English',
        'it': 'Italiano',
        'de-DE': 'Deutsch',
        'de-CH': 'Deutsch (CH)',
        'fr': 'Français',
        'es': 'Español',
        'pt': 'Português',
        'ja': '日本語',
        'ko': '한국어',
        'zh': '中文',
        'ru': 'Русский',
        'ar': 'العربية',
        'hi': 'हिन्दी',
        'tr': 'Türkçe',
        'pl': 'Polski',
        'nl': 'Nederlands',
        'sv': 'Svenska',
        'da': 'Dansk',
        'no': 'Norsk',
        'fi': 'Suomi'
    };

    /**
     * Get supported locales from the backend for a specific project
     * Falls back to default locales if the API call fails
     */
    static async getSupportedLocales(companyId?: string, projectId?: string): Promise<SupportedLocale[]> {
        try {
            if (!companyId || !projectId) {
                return this.DEFAULT_LOCALES;
            }

            const projectService = new ProjectService();
            const languages = await projectService.getAllLanguages(companyId, projectId);

            return languages.map(langCode => ({
                code: langCode,
                name: this.NAME_MAP[langCode] || langCode.toUpperCase(),
                flag: this.FLAG_MAP[langCode] || '🌐'
            }));
        } catch (error) {
            console.warn('Failed to fetch supported locales, falling back to defaults:', error);
            return this.DEFAULT_LOCALES;
        }
    }

    /**
     * Get supported locales for the settings page format
     * Returns an array of objects with code and name properties
     */
    static async getSupportedLanguages(companyId?: string, projectId?: string): Promise<Array<{ code: string, name: string }>> {
        const locales = await this.getSupportedLocales(companyId, projectId);
        return locales.map(locale => ({
            code: locale.code,
            name: locale.name
        }));
    }

    /**
     * Get the display name for a language code
     */
    static getLanguageName(code: string): string {
        return this.NAME_MAP[code] || code.toUpperCase();
    }

    /**
     * Get the flag emoji for a language code
     */
    static getLanguageFlag(code: string): string {
        return this.FLAG_MAP[code] || '🌐';
    }

    /**
     * Get the default locales (fallback)
     */
    static getDefaultLocales(): SupportedLocale[] {
        return [...this.DEFAULT_LOCALES];
    }

    /**
     * Get available UI locales by dynamically discovering translation files
     * Scans the /frontend/localization directory to find available .json files
     */
    static async getAvailableUILocales(): Promise<SupportedLocale[]> {
        try {
            // Test common locale codes to see which translation files exist
            const potentialLocales = [
                'en', 'it', 'de-DE', 'de-CH', 'fr', 'es', 'pt', 'ja', 'ko', 'zh', 'ru', 'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi'
            ];
            const availableLocales: string[] = [];

            for (const locale of potentialLocales) {
                try {
                    // Test if the locale file exists by attempting to import it
                    await import(`../../localization/${locale}.json`);
                    availableLocales.push(locale);
                } catch (error) {
                    // File doesn't exist, skip this locale
                    continue;
                }
            }

            if (availableLocales.length === 0) {
                // Fallback if no files found
                availableLocales.push('en');
            }

            return availableLocales.map(code => ({
                code,
                name: this.NAME_MAP[code] || code.toUpperCase(),
                flag: this.FLAG_MAP[code] || '🌐'
            }));
        } catch (error) {
            console.warn('Failed to dynamically discover localization files:', error);
            // Fallback to known existing files
            return [
                { code: 'en', name: 'English', flag: '🇬🇧' },
                { code: 'it', name: 'Italiano', flag: '🇮🇹' }
            ];
        }
    }

    /**
     * Get available UI locales synchronously using a cached result
     * This method provides immediate results but may not reflect recently added files
     */
    static getAvailableUILocalesSync(): SupportedLocale[] {
        // Known files that should exist - update manually when adding files
        const knownLocales = ['en', 'it'];

        return knownLocales.map(code => ({
            code,
            name: this.NAME_MAP[code] || code.toUpperCase(),
            flag: this.FLAG_MAP[code] || '🌐'
        }));
    }
}