'use client'

import React from 'react'
import Link from 'next/link'
import PlansMatrix from '../components/PlansMatrix'
import '../page.css'

export default function SubscriptionsPage() {
    return (
        <div className="landing-page">
            <header className="properties-header">
                <div className="header-title">
                    <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="header-logo" />
                </div>
                <div className="header-actions">
                    <Link href="/login" className="navbar-item">
                        Login
                    </Link>
                    <Link href="/signup" className="navbar-item navbar-button">
                        Try it for free
                    </Link>
                </div>
            </header>

            <main className="main-content">
                <div className="page-title">
                    <h1>Plans & Pricing</h1>
                    <p>Choose the plan that fits your team's needs.</p>
                </div>

                <PlansMatrix />

            </main>
        </div>
    )
}
