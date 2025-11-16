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
                    <div className="navbar-item">Loading...</div>
                ) : session && user ? (
                    <>
                        <div className="account-tab">{user.username || ''}</div>
                        <button onClick={handleDashboard} className="back-btn">
                            ← Dashboard
                        </button>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="navbar-item">
                            Login
                        </Link>
                        <Link href="/signup" className="navbar-item navbar-button">
                            Try it for free
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}