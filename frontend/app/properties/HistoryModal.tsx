'use client'

import { useState, useEffect } from 'react'
import { HistoryItem, HistoryService } from '../services/HistoryService'
import './HistoryModal.css'

interface HistoryModalProps {
    isOpen: boolean
    onClose: () => void
    valueKey: string
    propertyKey: string
    language: string
}

export default function HistoryModal({
    isOpen,
    onClose,
    valueKey,
    propertyKey,
    language
}: HistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load history when modal opens
    useEffect(() => {
        if (isOpen && valueKey) {
            loadHistory()
        }
    }, [isOpen, valueKey])

    const loadHistory = async () => {
        console.log('Loading history for valueKey:', valueKey)
        setLoading(true)
        setError(null)
        try {
            const historyData = await HistoryService.getHistoryByValueId(valueKey)
            console.log('History data received:', historyData)
            // Sort by timestamp descending (newest first)
            const sortedHistory = historyData.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            setHistory(sortedHistory)
        } catch (err) {
            setError('Failed to load history')
            console.error('Error loading history:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    const formatChange = (previousValue: any, newValue: any) => {
        const previousText = previousValue?.text || ''
        const newText = newValue?.text || ''
        const previousVerified = previousValue?.isVerified || false
        const newVerified = newValue?.isVerified || false
        const previousReviewed = previousValue?.isReviewed || false
        const newReviewed = newValue?.isReviewed || false

        if (!previousValue && newValue) {
            return { type: 'created', description: 'Created' }
        }
        if (previousValue && !newValue) {
            return { type: 'deleted', description: 'Deleted' }
        }

        // Check for any changes
        const textChanged = previousText !== newText
        const verifiedChanged = previousVerified !== newVerified
        const reviewedChanged = previousReviewed !== newReviewed

        if (textChanged || verifiedChanged || reviewedChanged) {
            let changes = []
            if (textChanged) changes.push('text')
            if (verifiedChanged) changes.push(newVerified ? 'verified' : 'unverified')
            if (reviewedChanged) changes.push(newReviewed ? 'reviewed' : 'unreviewed')

            return {
                type: 'updated',
                description: `Updated (${changes.join(', ')})`,
                changes: {
                    textChanged,
                    verifiedChanged,
                    reviewedChanged,
                    previousVerified,
                    newVerified,
                    previousReviewed,
                    newReviewed
                }
            }
        }

        return { type: 'unchanged', description: 'No change' }
    }

    const truncateText = (text: string, maxLength: number = 100) => {
        if (!text) return ''
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    if (!isOpen) return null

    return (
        <div className="history-modal-overlay" onClick={onClose}>
            <div className="history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="history-modal-header">
                    <h3>History for {propertyKey} ({language})</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="history-modal-content">
                    {error && (
                        <div className="error-message">
                            {error}
                            <button onClick={() => setError(null)}>×</button>
                        </div>
                    )}

                    {loading && <div className="loading-message">Loading history...</div>}

                    <div className="history-list">
                        {history.length === 0 && !loading ? (
                            <p className="no-history">No history</p>
                        ) : (
                            history.map((item, index) => {
                                const change = formatChange(item.previousValue, item.newValue)
                                const previousText = item.previousValue?.text || ''
                                const newText = item.newValue?.text || ''

                                return (
                                    <div key={index} className={`history-item ${change.type}`}>
                                        <div className="history-header">
                                            <div className="history-meta">
                                                <span className={`change-type ${change.type}`}>
                                                    {change.type === 'created' && '➕'}
                                                    {change.type === 'updated' && '✏️'}
                                                    {change.type === 'deleted' && '🗑️'}
                                                    {change.description}
                                                </span>
                                                <span className="history-user">{item.userName || 'Anonymous'}</span>
                                                <span className="history-date">{formatDate(item.timestamp)}</span>
                                            </div>
                                        </div>

                                        <div className="history-changes">
                                            {/* Text changes */}
                                            {(previousText || newText) && previousText !== newText && (
                                                <div className="text-changes">
                                                    {previousText && (
                                                        <div className="text-change previous">
                                                            <label>Previous text:</label>
                                                            <div className="text-content" title={previousText}>
                                                                {truncateText(previousText)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {newText && (
                                                        <div className="text-change new">
                                                            <label>New text:</label>
                                                            <div className="text-content" title={newText}>
                                                                {truncateText(newText)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Status changes */}
                                            {change.changes && (change.changes.verifiedChanged || change.changes.reviewedChanged) && (
                                                <div className="status-changes">
                                                    <label>Status changes:</label>
                                                    <div className="status-change-list">
                                                        {change.changes.verifiedChanged && (
                                                            <div className="status-change">
                                                                <span className="status-label">Verified:</span>
                                                                <span className={`status-value previous ${change.changes.previousVerified ? 'verified' : 'unverified'}`}>
                                                                    {change.changes.previousVerified ? '✓' : '✗'}
                                                                </span>
                                                                <span className="arrow">→</span>
                                                                <span className={`status-value new ${change.changes.newVerified ? 'verified' : 'unverified'}`}>
                                                                    {change.changes.newVerified ? '✓' : '✗'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {change.changes.reviewedChanged && (
                                                            <div className="status-change">
                                                                <span className="status-label">Reviewed:</span>
                                                                <span className={`status-value previous ${change.changes.previousReviewed ? 'reviewed' : 'unreviewed'}`}>
                                                                    {change.changes.previousReviewed ? '👁' : '👁‍🗨'}
                                                                </span>
                                                                <span className="arrow">→</span>
                                                                <span className={`status-value new ${change.changes.newReviewed ? 'reviewed' : 'unreviewed'}`}>
                                                                    {change.changes.newReviewed ? '👁' : '👁‍🗨'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {!previousText && !newText && (!change.changes || (!change.changes.verifiedChanged && !change.changes.reviewedChanged)) && (
                                                <div className="text-change">
                                                    <span className="no-text">No changes detected</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {history.length > 0 && (
                        <div className="history-footer">
                            <p className="history-count">
                                Total changes: {history.length}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}