'use client'

import { useAuth } from '../../contexts/AuthContext'
import { PropertyService } from '../../services/PropertyService'
import { HistoryService } from '../../services/HistoryService'
import type { HistoryItem, PropertySearchRequest } from '../../types/domain'
import { useEffect, useState } from 'react'
import './Home.css'
import { ProjectService } from '../../services/ProjectService'
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
    const { user } = useAuth()
    const t = useTranslations('dashboard')
    const [pendingReviews, setPendingReviews] = useState<string>("0")
    const [recentActivity, setRecentActivity] = useState<HistoryItem[]>([])
    const [supportedLanguages, setSupportedLanguages] = useState<string>("0")
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isActivityLoading, setIsActivityLoading] = useState<boolean>(true)
    const [isLanguagesLoading, setIsLanguagesLoading] = useState<boolean>(true)

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
            if (user?.mainProjectId == null || user?.companyId == null) {
                setSupportedLanguages("-")
                return
            }

            const languages = await new ProjectService().getAllLanguages(user.companyId, user.mainProjectId)
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
        const lang = (item.newValue?.language || item.previousValue?.language || '').toUpperCase()
        const key = item.valueKey || ''

        if (item.newValue && !item.previousValue) {
            return t('recentActivity.messages.newTranslation', { key, lang })
        } else if (item.newValue && item.previousValue) {
            if (item.newValue.isReviewed !== item.previousValue.isReviewed && item.newValue.isReviewed) {
                return t('recentActivity.messages.reviewCompleted', { key, lang })
            } else if (item.newValue.isVerified !== item.previousValue.isVerified && item.newValue.isVerified) {
                return t('recentActivity.messages.verified', { key, lang })
            } else {
                return t('recentActivity.messages.updated', { key, lang })
            }
        } else if (item.previousValue && !item.newValue) {
            return t('recentActivity.messages.removed', { key, lang })
        }
        return t('recentActivity.messages.generic', { key })
    }

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp)
        // Use fallback locale 'en-US' (do not rely on user.locale presence in User type)
        const locale = 'en-US'
        return date.toLocaleTimeString(locale, {
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
            <main className="home-content">
                {/* Navigation Cards */}
                <div className="navigation-section">
                    <div className="user-info-tab">
                        <>
                            <div className="account-line"><strong>{t('companyLabel')}</strong> {user?.companyName ?? '—'}</div>
                            <div className="account-line"><strong>{t('projectLabel')}</strong> {user?.mainProjectName ?? '—'}</div>
                        </>
                    </div>
                    <div className="navigation-cards">
                        {(t.raw('navCards') || []).map((card: any, idx: number) => (
                            <a key={idx} href={card.href} className="nav-card">
                                <div className="nav-card-icon">{card.icon}</div>
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>{t('cards.supportedLanguages.heading')}</h3>
                        <p className="card-number">
                            {isLanguagesLoading ? t('cards.supportedLanguages.loading') : supportedLanguages}
                        </p>
                        <p className="card-description">{t('cards.supportedLanguages.description')}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>{t('cards.completedTranslations.heading')}</h3>
                        <p className="card-number">{recentActivity.length == 0 ? t('cards.completedTranslations.none') : recentActivity.length}</p>
                        <p className="card-description">{t('cards.completedTranslations.description')}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>{t('cards.pendingReviews.heading')}</h3>
                        <p className="card-number">
                            {isLoading ? t('cards.pendingReviews.loading') : pendingReviews.toLocaleString()}
                        </p>
                        <p className="card-description">{t('cards.pendingReviews.description')}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>{t('cards.pendingVerify.heading')}</h3>
                        <p className="card-number">
                            {isLoading ? t('cards.pendingVerify.loading') : pendingReviews.toLocaleString()}
                        </p>
                        <p className="card-description">{t('cards.pendingVerify.description')}</p>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>{t('recentActivity.heading')}</h3>
                    <div className="activity-list">
                        {isActivityLoading ? (
                            <div className="activity-item">
                                <span className="activity-text">{t('recentActivity.loading')}</span>
                            </div>
                        ) : recentActivity.length > 0 ? (
                            recentActivity.map((item, index) => (
                                <div key={`${item.valueKey}-${item.timestamp}-${index}`} className="activity-item">
                                    <span className="activity-time">{formatTime(item.timestamp)}</span>
                                    <span className="activity-text">{formatActivityDescription(item)}</span>
                                    {item.userName && (
                                        <span className="activity-user">{t('recentActivity.by', { userName: item.userName })}</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="activity-item">
                                <span className="activity-text">{t('recentActivity.noActivity')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}