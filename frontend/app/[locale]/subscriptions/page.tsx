'use client'

import React from 'react'
import PlansMatrix from '../../components/PlansMatrix'
import '../page.css'

export default function SubscriptionsPage() {
    return (
        <div className="landing-page">
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
