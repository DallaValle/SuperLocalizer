'use client'

import React from 'react'
import Link from 'next/link'
import './page.css'
import PlansMatrix from '../components/PlansMatrix'
import { useTranslations } from 'next-intl'

export default function HomePage() {
    const t = useTranslations('home');
    return (
        <div className="home-container">

            <main className="main-content">
                <div className="hero-section">
                    <p>{t('title')}</p>
                    <p>{t('subtitle')}</p>
                </div>

                <div className="content-container">
                    <ul>
                        {(t.raw('features.items') || []).map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="hero-section">
                    <p>{t('slogan')}</p>
                    <br />
                    <p>{t('automation')}</p>
                </div>

                <div className="content-container">
                    <h2>{t('getStarted.heading')}</h2>
                    <p>{t('getStarted.description')}</p>
                    <Link href="/signup" className="get-started-button">
                        {t('getStarted.button')}
                    </Link>
                </div>

                <div className="hero-section">
                    <p>{t('plans')}</p>
                </div>

                <PlansMatrix />

                <div className="flow-image-container">
                    <img src="/img/flow.png" alt={t('flowImageAlt')} className="flow-image" />
                </div>
            </main>
        </div>
    )
}