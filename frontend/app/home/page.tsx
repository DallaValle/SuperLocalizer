'use client'

import { useAuth } from '../contexts/AuthContext'
import { PropertyService, PropertySearchRequest } from '../services/PropertyService'
import { useEffect, useState } from 'react'
import './Home.css'

export default function HomePage() {
    const { logout, token } = useAuth()
    const [pendingReviews, setPendingReviews] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const handleLogout = () => {
        logout()
    }

    const fetchPendingReviews = async () => {
        try {
            setIsLoading(true)
            const searchRequest: PropertySearchRequest = {
                page: 1,
                size: 1, // We only need the count, so minimal page size
                isReviewed: false // Filter for not reviewed items
            }

            const response = await PropertyService.searchProperties(searchRequest)
            setPendingReviews(response.totalItems)
        } catch (error) {
            console.error('Error fetching pending reviews:', error)
            setPendingReviews(0)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPendingReviews()
    }, [])

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>SuperLocalizer Dashboard</h1>
                <div className="user-info">
                    <span>Welcome!</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <main className="home-content">
                {/* Navigation Cards */}
                <div className="navigation-section">
                    <h2>Quick Actions</h2>
                    <div className="navigation-cards">
                        <a href="/properties" className="nav-card">
                            <div className="nav-card-icon">📝</div>
                            <h3>Manage Translations</h3>
                            <p>View and edit all translations</p>
                        </a>

                        <div className="nav-card">
                            <div className="nav-card-icon">📊</div>
                            <h3>Reports</h3>
                            <p>Translation statistics and analytics</p>
                        </div>

                        <div className="nav-card">
                            <div className="nav-card-icon">⚙️</div>
                            <h3>Settings</h3>
                            <p>Configure projects and languages</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Supported Languages</h3>
                        <p className="card-number">5</p>
                        <p className="card-description">Available languages for translation</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Completed Translations</h3>
                        <p className="card-number">1,247</p>
                        <p className="card-description">Keys translated this month</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Pending Reviews</h3>
                        <p className="card-number">
                            {isLoading ? '...' : pendingReviews.toLocaleString()}
                        </p>
                        <p className="card-description">Translations awaiting review</p>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-time">10:30</span>
                            <span className="activity-text">New translation added for "welcome_message" in IT</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">09:15</span>
                            <span className="activity-text">Review completed for "Mobile App" project</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">08:45</span>
                            <span className="activity-text">New project "Website v2" created</span>
                        </div>
                    </div>
                </div>

                <div className="debug-info">
                    <h4>Debug Info:</h4>
                    <p>Token: {token ? `${token.substring(0, 20)}...` : 'Not available'}</p>
                </div>
            </main>
        </div>
    )
}