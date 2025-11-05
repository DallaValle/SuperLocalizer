'use client'

import React from 'react'
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
                <div className="hero-section">
                    <p>Welcome to SuperLocalizer</p>
                    <p>Your localization management solution</p>
                </div>

                <div className="content-container">
                    <ul>
                        <li>Create continuous localization workflows</li>
                        <li>Auto-translate with AI translation or real experts</li>
                        <li>Integrate with your favorite tools</li>
                        <li>Reduce time-consuming manual tasks and empower developers to localize at twice the speed</li>
                        <li>Set up automation rules with a few clicks</li>
                        <li>Auto-approve and reuse translations</li>
                    </ul>
                </div>

                <div className="hero-section">
                    <p>Automation as first!</p>
                </div>

                <div className="content-container">
                    <h2>Get Started Today</h2>
                    <p>Sign up for a free trial and experience the power of SuperLocalizer for your localization needs.</p>
                    <Link href="/signup" className="get-started-button">
                        Try it for free
                    </Link>
                </div>

                <div className="hero-section">Plans</div>

                <div className="content-container plans-matrix">
                    <div className="plans-table">
                        <div className="plans-row plans-header">
                            <div className="plans-cell"></div>
                            <div className="plans-cell plans-col">free</div>
                            <div className="plans-cell plans-col">essential</div>
                            <div className="plans-cell plans-col">hero</div>
                        </div>

                        <div className="plans-row">
                            <div className="plans-cell">Price</div>
                            <div className="plans-cell">$0</div>
                            <div className="plans-cell">$9/mo</div>
                            <div className="plans-cell">$29/mo</div>
                        </div>

                        <div className="plans-row">
                            <div className="plans-cell">Projects</div>
                            <div className="plans-cell">1</div>
                            <div className="plans-cell">5</div>
                            <div className="plans-cell">Unlimited</div>
                        </div>

                        <div className="plans-row">
                            <div className="plans-cell">Auto-translate</div>
                            <div className="plans-cell">No</div>
                            <div className="plans-cell">Yes (limited)</div>
                            <div className="plans-cell">Yes (full)</div>
                        </div>

                        <div className="plans-row">
                            <div className="plans-cell">Real human experts verification</div>
                            <div className="plans-cell">No</div>
                            <div className="plans-cell">Still no :(</div>
                            <div className="plans-cell">Yes (ch, de, en, fr, it)</div>
                        </div>

                        <div className="plans-row">
                            <div className="plans-cell">Automation</div>
                            <div className="plans-cell">Api endpoints</div>
                            <div className="plans-cell">Git Hub</div>
                            <div className="plans-cell">All</div>
                        </div>

                        <div className="plans-row">
                            <div className="plans-cell">Support</div>
                            <div className="plans-cell">Community</div>
                            <div className="plans-cell">Email</div>
                            <div className="plans-cell">Priority</div>
                        </div>

                        <div className="plans-row">
                            <div className="plans-cell">Actions</div>
                            <div className="plans-cell"><a href="/signup" className="get-started-button">Get free</a></div>
                            <div className="plans-cell"><a href="/signup" className="get-started-button">Choose essential</a></div>
                            <div className="plans-cell"><a href="/signup" className="get-started-button">Choose hero</a></div>
                        </div>
                    </div>
                </div>

                <div className="flow-image-container">
                    <img src="/img/flow.png" alt="SuperLocalizer Workflow" className="flow-image" />
                </div>
            </main>
        </div>
    )
}