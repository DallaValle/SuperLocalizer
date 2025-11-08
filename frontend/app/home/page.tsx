'use client'

import { useAuth } from '../contexts/AuthContext'
import { PropertyService } from '../services/PropertyService'
import { HistoryService } from '../services/HistoryService'
import type { HistoryItem, PropertySearchRequest } from '../types/domain'
import { useEffect, useState } from 'react'
import './Home.css'

export default function HomePage() {
    const { logout, user } = useAuth()
    const [pendingReviews, setPendingReviews] = useState<string>("0")
    const [recentActivity, setRecentActivity] = useState<HistoryItem[]>([])
    const [supportedLanguages, setSupportedLanguages] = useState<string>("0")
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isActivityLoading, setIsActivityLoading] = useState<boolean>(true)
    const [isLanguagesLoading, setIsLanguagesLoading] = useState<boolean>(true)

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
            if (user?.mainProjectId == null) {
                setPendingReviews("-")
                return
            }

            const response = await new PropertyService(user.mainProjectId).searchProperties(searchRequest)
            setPendingReviews(response.totalItems.toString())
        } catch (error) {
            console.error('Error fetching pending reviews:', error)
            setPendingReviews("-")
        } finally {
            setIsLoading(false)
        }
    }



    const fetchSupportedLanguages = async () => {
        try {
            setIsLanguagesLoading(true)
            if (user?.mainProjectId == null) {
                setSupportedLanguages("-")
                return
            }

            const languages = await new PropertyService(user.mainProjectId).getAllLanguages()
            setSupportedLanguages(languages.length.toString())
        } catch (error) {
            console.error('Error fetching supported languages:', error)
            setSupportedLanguages("-")
        } finally {
            setIsLanguagesLoading(false)
        }
    }

    const fetchTodayActivity = async () => {
        try {
            setIsActivityLoading(true)
            if (user?.mainProjectId == null) {
                // No project selected — nothing to load
                setRecentActivity([])
                return
            }
            const today = new Date()
            // Format: YYYY-MM-DDTHH:mm:ss (start of day)
            const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString().slice(0, 19)
            const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString().slice(0, 19)

            const projectId = user.mainProjectId!
            const response = await HistoryService.searchHistory({
                projectId,
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
        if (user) {
            fetchPendingReviews()
            fetchTodayActivity()
            fetchSupportedLanguages()
        }
    }, [user])

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="header-title">
                    <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="header-logo" />
                </div>
                <div className="user-info">
                    <div className="account-tab">{user && user.username ? user.username : ''}</div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <main className="home-content">
                {/* Navigation Cards */}
                <div className="navigation-section">
                    <div className="user-info-tab">
                        {(user?.companyName == null && user?.mainProjectName == null) ? (
                            <>
                                <div className="account-line"><strong>Hey! Not ready yet? Go to configuration to create your first Company and Project! ↓ ↓ ↓ ↓ ↓</strong></div>
                            </>
                        ) : (
                            <>
                                <div className="account-line"><strong>Company:</strong> {user?.companyName ?? '—'}</div>
                                <div className="account-line"><strong>Project:</strong> {user?.mainProjectName ?? '—'}</div>
                            </>
                        )}
                    </div>
                    <div className="navigation-cards">
                        {/* If mainProjectId is not set, prevent navigation to /properties */}
                        <a
                            href={user?.mainProjectId == null ? '#' : '/properties'}
                            className={"nav-card" + (user?.mainProjectId == null ? ' disabled' : '')}
                            aria-disabled={user?.mainProjectId == null ? 'true' : undefined}
                            aria-describedby={user?.mainProjectId == null ? 'manage-translations-tooltip' : undefined}
                        >
                            <div className="nav-card-icon">📝</div>
                            <h3>Manage Translations</h3>
                            <p>View and edit all translations</p>

                            {user?.mainProjectId == null && (
                                <span id="manage-translations-tooltip" className="nav-tooltip" role="tooltip">
                                    🏃‍♂️ Kick things off! Create your first project in Configuration!
                                </span>
                            )}
                        </a>

                        <a href="/configuration" className="nav-card">
                            <div className="nav-card-icon">⚙️</div>
                            <h3>Configuration</h3>
                            <p>Configure projects and more</p>
                        </a>

                        <a href="/actions" className="nav-card">
                            <div className="nav-card-icon">🚀</div>
                            <h3>Bulk actions</h3>
                            <p>Fast is best!</p>
                        </a>

                        <a href="/automation" className="nav-card">
                            <div className="nav-card-icon">🤖</div>
                            <h3>Automation</h3>
                            <p>Configure import, export, merge and triggers!</p>
                        </a>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Supported Languages</h3>
                        <p className="card-number">
                            {isLanguagesLoading ? '...' : supportedLanguages}
                        </p>
                        <p className="card-description">Available languages for translation</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Completed Translations</h3>
                        <p className="card-number">{recentActivity.length}</p>
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
            </main>
        </div>
    )
}