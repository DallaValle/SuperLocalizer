"use client";

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User } from '../types/domain';
import { useTranslations } from 'next-intl'

export default function NavBar() {
    const t = useTranslations('NavBar');
    const { data: session, status } = useSession();
    const user = session?.user as User | undefined;

    const handleLogout = async () => {
        await signOut({ redirect: false });
        window.location.href = '/login';
    };

    const handleDashboard = () => {
        window.location.href = '/dashboard';
    };

    return (
        <header className="properties-header">
            <div className="header-title">
                <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="header-logo" />
            </div>
            <div className="header-actions">
                {status === 'loading' ? (
                    <div className="navbar-item">{t('loading')}</div>
                ) : session && user ? (
                    <>
                        <div className="account-tab">{t('account', { username: user.username || '' })}</div>
                        <button onClick={handleDashboard} className="back-btn">
                            {t('dashboard')}
                        </button>
                        <button onClick={handleLogout} className="logout-btn">
                            {t('logout')}
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="navbar-item">
                            {t('login')}
                        </Link>
                        <Link href="/signup" className="navbar-item navbar-button">
                            {t('tryIt')}
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}