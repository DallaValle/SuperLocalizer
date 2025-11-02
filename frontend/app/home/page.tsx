'use client'

import { useAuth } from '../contexts/AuthContext'
import { PropertyService } from '../services/PropertyService'
import { HistoryService } from '../services/HistoryService'
import { AuthService } from '../services/AuthService'
import type { HistoryItem, PropertySearchRequest } from '../types/domain'
import { useEffect, useState } from 'react'
import './Home.css'

export default function HomePage() {
    const { logout, token, user } = useAuth()
    const [fetchedUser, setFetchedUser] = useState<typeof user | null>(null)
    const [pendingReviews, setPendingReviews] = useState<number>(0)
    const [recentActivity, setRecentActivity] = useState<HistoryItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isActivityLoading, setIsActivityLoading] = useState<boolean>(true)

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

    const fetchCurrentUser = async () => {
        try {
            const u = await AuthService.getCurrentUser()
            if (u) setFetchedUser(u)
        } catch (error) {
            console.error('Error fetching current user:', error)
        }
    }

    const fetchTodayActivity = async () => {
        try {
            setIsActivityLoading(true)
            const today = new Date()
            // Format: YYYY-MM-DDTHH:mm:ss (start of day)
            const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString().slice(0, 19)
            const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString().slice(0, 19)

            const response = await HistoryService.searchHistory({
                fromDate: todayStart,
                toDate: todayEnd,
                page: 1,
                size: 10 // Get last 10 activities for today
            })

            // Sort by timestamp descending (most recent first)
            const sortedActivity = response.items.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )

            setRecentActivity(sortedActivity)
        } catch (error) {
            console.error('Error fetching today\'s activity:', error)
            setRecentActivity([])
        } finally {
            setIsActivityLoading(false)
        }
    }

    const formatActivityDescription = (item: HistoryItem): string => {
        if (item.newValue && !item.previousValue) {
            // New translation added
            return `New translation added for "${item.valueKey}" in ${item.newValue.language?.toUpperCase()}`
        } else if (item.newValue && item.previousValue) {
            // Translation updated
            if (item.newValue.isReviewed !== item.previousValue.isReviewed && item.newValue.isReviewed) {
                return `Review completed for "${item.valueKey}" in ${item.newValue.language?.toUpperCase()}`
            } else if (item.newValue.isVerified !== item.previousValue.isVerified && item.newValue.isVerified) {
                return `Translation verified for "${item.valueKey}" in ${item.newValue.language?.toUpperCase()}`
            } else {
                return `Translation updated for "${item.valueKey}" in ${item.newValue.language?.toUpperCase()}`
            }
        } else if (item.previousValue && !item.newValue) {
            // Translation deleted
            return `Translation removed for "${item.valueKey}" in ${item.previousValue.language?.toUpperCase()}`
        }
        return `Activity on "${item.valueKey}"`
    }

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    }

    useEffect(() => {
        fetchPendingReviews()
        fetchTodayActivity()
        fetchCurrentUser()
    }, [])

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="header-title">
                    <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="header-logo" />
                </div>
                <div className="user-info">
                    <span>{user && user.username ? user.username : ''}</span>
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
                        {/* If mainProjectId is not set, prevent navigation to /properties */}
                        <a
                            href={((fetchedUser || user)?.mainProjectId == null) ? '#'
                                : '/properties'}
                            className={"nav-card" + (((fetchedUser || user)?.mainProjectId == null) ? ' disabled' : '')}
                            onClick={(e) => {
                                if ((fetchedUser || user)?.mainProjectId == null) {
                                    e.preventDefault()
                                    alert('No main project selected. Please select a project in Configuration before accessing Properties.')
                                }
                            }}
                        >
                            <div className="nav-card-icon">📝</div>
                            <h3>Manage Translations</h3>
                            <p>View and edit all translations</p>
                        </a>

                        <a href="/configuration" className="nav-card">
                            <div className="nav-card-icon">⚙️</div>
                            <h3>Configuration</h3>
                            <p>Configure projects and languages</p>
                        </a>
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
                        {isActivityLoading ? (
                            <div className="activity-item">
                                <span className="activity-text">Loading recent activity...</span>
                            </div>
                        ) : recentActivity.length > 0 ? (
                            recentActivity.map((item, index) => (
                                <div key={`${item.valueKey}-${item.timestamp}-${index}`} className="activity-item">
                                    <span className="activity-time">{formatTime(item.timestamp)}</span>
                                    <span className="activity-text">{formatActivityDescription(item)}</span>
                                    {item.userName && (
                                        <span className="activity-user">by {item.userName}</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="activity-item">
                                <span className="activity-text">No activity recorded for today</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="debug-info">
                    <h4>Debug Info:</h4>
                    <p>{token ? token : 'Not available'}</p>
                </div>
            </main>
        </div>
    )
}