'use client'

import { useState, useEffect } from 'react'
import { HistoryItem, HistoryService } from '../services/HistoryService'
import './HistoryModal.css'

interface HistoryModalProps {
    isOpen: boolean
    onClose: () => void
    valueId: string
    propertyKey: string
    language: string
}

export default function HistoryModal({
    isOpen,
    onClose,
    valueId,
    propertyKey,
    language
}: HistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load history when modal opens
    useEffect(() => {
        if (isOpen && valueId) {
            loadHistory()
        }
    }, [isOpen, valueId])

    const loadHistory = async () => {
        setLoading(true)
        setError(null)
        try {
            const historyData = await HistoryService.getHistoryByValueId(valueId)
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

    const formatChange = (previousText: string, newText: string) => {
        if (!previousText && newText) {
            return { type: 'created', description: 'Created' }
        }
        if (previousText && !newText) {
            return { type: 'deleted', description: 'Deleted' }
        }
        if (previousText !== newText) {
            return { type: 'updated', description: 'Updated' }
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
                                const change = formatChange(item.previousText, item.newText)

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
                                            {item.previousText && (
                                                <div className="text-change previous">
                                                    <label>Previous:</label>
                                                    <div className="text-content" title={item.previousText}>
                                                        {truncateText(item.previousText)}
                                                    </div>
                                                </div>
                                            )}

                                            {item.newText && (
                                                <div className="text-change new">
                                                    <label>New:</label>
                                                    <div className="text-content" title={item.newText}>
                                                        {truncateText(item.newText)}
                                                    </div>
                                                </div>
                                            )}

                                            {!item.previousText && !item.newText && (
                                                <div className="text-change">
                                                    <span className="no-text">No text content</span>
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