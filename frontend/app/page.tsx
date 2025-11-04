'use client'

import Link from 'next/link'
import './page.css'

export default function LandingPage() {
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
                <div className="content-container hero-section">
                    <p>Welcome to SuperLocalizer</p>
                    <p>Your localization management solution</p>
                </div>

                <div className="content-container">
                    <p>Why Choose SuperLocalizer?</p>
                    <ul>
                        <li>Create continuous localization workflows</li>
                        <li>Integrate with your favorite tools</li>
                        <li>Collaborate with your team seamlessly</li>
                        <li>Reduce time-consuming manual tasks and empower developers to localize at twice the speed</li>
                        <li>Auto-translate with AI translation</li>
                        <li>Set up automation rules with a few clicks</li>
                        <li>Auto-approve and reuse translations</li>
                    </ul>
                </div>

                <div className="content-container hero-section">
                    <p>Automation as first!</p>
                </div>

                <div className="flow-image-container">
                    <img src="/img/flow.png" alt="SuperLocalizer Workflow" className="flow-image" />
                </div>
            </main>
        </div>
    )
}