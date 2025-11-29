"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LocaleService, SupportedLocale } from '../services/LocaleService';
import './Footer.css';

export default function Footer() {
    const t = useTranslations('Footer');
    const router = useRouter();
    const pathname = usePathname();
    const [supportedLocales, setSupportedLocales] = useState<SupportedLocale[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getCurrentLocale = () => {
        const segments = pathname.split('/');
        return segments[1] || 'en';
    };

    const handleLanguageChange = (newLocale: string) => {
        const currentLocale = getCurrentLocale();
        const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
        router.push(newPath);
    };

    const currentLocale = getCurrentLocale();

    useEffect(() => {
        const loadUILocales = async () => {
            setIsLoading(true);
            try {
                // Dynamically discover available UI locales
                const locales = await LocaleService.getAvailableUILocales();
                setSupportedLocales(locales);
            } catch (error) {
                console.error('Error loading UI locales:', error);
                // Fallback to synchronous method
                setSupportedLocales(LocaleService.getAvailableUILocalesSync());
            } finally {
                setIsLoading(false);
            }
        };

        loadUILocales();
    }, []); // No dependencies since this scans the file system

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <div className="footer-logo">
                        <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="footer-logo-img" />
                        <span className="footer-title">SuperLocalizer</span>
                    </div>
                    <p className="footer-description">{t('description')}</p>
                </div>

                <div className="footer-center">
                    <div className="footer-links">
                        <h4>{t('quickLinks')}</h4>
                        <ul>
                            <li><a href="/properties">{t('properties')}</a></li>
                            <li><a href="/configuration">{t('configuration')}</a></li>
                            <li><a href="/settings">{t('settings')}</a></li>
                            <li><a href="/dashboard">{t('dashboard')}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-right">
                    <div className="language-selector">
                        <label htmlFor="language-select" className="language-label">
                            {t('languageLabel')}
                        </label>
                        <div className="language-dropdown">
                            <select
                                id="language-select"
                                value={currentLocale}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="language-select"
                                disabled={isLoading}
                            >
                                {supportedLocales.map((locale) => (
                                    <option key={locale.code} value={locale.code}>
                                        {locale.flag} {locale.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="footer-info">
                        <p className="copyright">
                            © {new Date().getFullYear()} SuperLocalizer. {t('allRightsReserved')}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}