'use client'

import React from 'react'
import Link from 'next/link'
import './page.css'
import PlansMatrix from '../components/PlansMatrix'

export default function HomePage() {
    return (
        <div className="home-container">

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

                <div className="hero-section">
                    <p>Plans</p>
                </div>

                <PlansMatrix />

                <div className="flow-image-container">
                    <img src="/img/flow.png" alt="SuperLocalizer Workflow" className="flow-image" />
                </div>
            </main>
        </div>
    )
}