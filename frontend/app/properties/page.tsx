'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { PropertyService, type Property, type PropertySearchRequest, type PropertySearchResponse, type PropertyValue, type PropertyValueUpdateRequest } from '../services/PropertyService'
import CommentsModal from './CommentsModal'
import './Properties.css'

export default function PropertiesPage() {
    const { logout } = useAuth()
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState('')
    const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null)
    const [reviewedFilter, setReviewedFilter] = useState<boolean | null>(null)
    const [editingValues, setEditingValues] = useState<{ [key: string]: PropertyValue }>({})
    const [savingValues, setSavingValues] = useState<{ [key: string]: boolean }>({})
    const [activeEditFields, setActiveEditFields] = useState<{ [key: string]: boolean }>({})
    const [commentsModal, setCommentsModal] = useState<{
        isOpen: boolean
        propertyKey: string
        language: string
        valueId: string
    }>({
        isOpen: false,
        propertyKey: '',
        language: '',
        valueId: ''
    })

    const availableLanguages = ['de-DE', 'it', 'fr', 'en', 'de-CH']

    // Function to auto-resize textarea based on content
    const autoResizeTextarea = (element: HTMLTextAreaElement) => {
        const textLength = element.value.length;
        const lineWidth = 80; // approximate characters per line
        const minRows = 1;
        const maxRows = 10;

        // Calculate rows based on text length and line breaks
        const textLines = element.value.split('\n').length;
        const wrappedLines = Math.ceil(textLength / lineWidth);
        const calculatedRows = Math.max(textLines, wrappedLines);

        const finalRows = Math.max(minRows, Math.min(maxRows, calculatedRows));
        element.rows = finalRows;
    };

    // Function to toggle edit mode for a specific field
    const toggleEditMode = (propertyKey: string, language: string, isActive: boolean) => {
        const fieldKey = `${propertyKey}-${language}`;
        setActiveEditFields(prev => ({
            ...prev,
            [fieldKey]: isActive
        }));
    };

    // Function to check if text should show ellipsis
    const shouldShowEllipsis = (text: string, maxLength: number = 100) => {
        return text.length > maxLength;
    };

    // Function to get truncated text
    const getTruncatedText = (text: string, maxLength: number = 100) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    useEffect(() => {
        loadProperties()
    }, [currentPage, pageSize, searchTerm, selectedLanguage, verifiedFilter, reviewedFilter])

    useEffect(() => {
        const newEditingValues: { [key: string]: PropertyValue } = {}
        properties.forEach(property => {
            property.values.forEach(value => {
                const editKey = getEditKey(property.key, value.language)
                newEditingValues[editKey] = { ...value }
            })
        })
        setEditingValues(newEditingValues)
    }, [properties])

    const loadProperties = async () => {
        setLoading(true)
        setError(null)

        try {
            const request: PropertySearchRequest = {
                page: currentPage,
                size: pageSize,
                ...(searchTerm && { searchTerm }),
                ...(selectedLanguage && { language: selectedLanguage }),
                ...(verifiedFilter !== null && { isVerified: verifiedFilter }),
                ...(reviewedFilter !== null && { isReviewed: reviewedFilter })
            }

            const response: PropertySearchResponse = await PropertyService.searchProperties(request)

            setProperties(response.items)
            setTotalPages(response.totalPages)
            setTotalItems(response.totalItems)
        } catch (err) {
            setError('Error loading properties')
            console.error('Error loading properties:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1) // Reset to first page
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1) // Reset to first page
        loadProperties()
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedLanguage('')
        setVerifiedFilter(null)
        setReviewedFilter(null)
        setCurrentPage(1)
    }

    const getLanguageFlag = (language: string) => {
        const flags: { [key: string]: string } = {
            'de-DE': '🇩🇪',
            'de-CH': '🇨🇭',
            'it': '🇮🇹',
            'fr': '🇫🇷',
            'en': '🇬🇧'
        }
        return flags[language] || '🌐'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getEditKey = (propertyKey: string, language: string) => {
        return `${propertyKey}|${language}`
    }

    const updateEditingValue = (propertyKey: string, language: string, field: keyof PropertyValue, value: any) => {
        const editKey = getEditKey(propertyKey, language)
        setEditingValues(prev => ({
            ...prev,
            [editKey]: {
                ...prev[editKey],
                [field]: value
            }
        }))
    }

    const commitChanges = async (propertyKey: string, language: string) => {
        const editKey = getEditKey(propertyKey, language)
        const editingValue = editingValues[editKey]

        if (!editingValue) return

        setSavingValues(prev => ({ ...prev, [editKey]: true }))

        try {
            const updateRequest: PropertyValueUpdateRequest = {
                text: editingValue.text,
                isVerified: editingValue.isVerified,
                isReviewed: editingValue.isReviewed
            }

            await PropertyService.updatePropertyValue(propertyKey, language, updateRequest)

            setProperties(prev => prev.map(property => {
                if (property.key === propertyKey) {
                    return {
                        ...property,
                        values: property.values.map(value => {
                            if (value.language === language) {
                                return { ...editingValue }
                            }
                            return value
                        }),
                        updateDate: new Date().toISOString()
                    }
                }
                return property
            }))

        } catch (err) {
            console.error('Error updating property value:', err)
            setError('Error during save')
        } finally {
            setSavingValues(prev => {
                const newState = { ...prev }
                delete newState[editKey]
                return newState
            })
        }
    }

    const openCommentsModal = (propertyKey: string, language: string, valueId: string) => {
        setCommentsModal({
            isOpen: true,
            propertyKey,
            language,
            valueId
        })
    }

    const closeCommentsModal = () => {
        setCommentsModal({
            isOpen: false,
            propertyKey: '',
            language: '',
            valueId: ''
        })
    }

    const handleCommentsUpdated = () => {
        // Reload properties to get updated comment counts
        loadProperties()
    }

    const renderPagination = () => {
        const maxVisiblePages = 5
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        return (
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    ««
                </button>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    ‹
                </button>

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    ›
                </button>
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    »»
                </button>
            </div>
        )
    }

    return (
        <div className="properties-container">
            <header className="properties-header">
                <h1>Translation Management</h1>
                <div className="header-actions">
                    <button onClick={() => window.location.href = '/home'} className="back-btn">
                        ← Dashboard
                    </button>
                    <button onClick={logout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <div className="properties-content">
                {/* Filtri e Ricerca */}
                <div className="filters-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Search by key..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <button type="submit" className="search-btn">
                                🔍 Search
                            </button>
                            <button type="button" onClick={clearFilters} className="clear-btn">
                                🗑 Clear Filters
                            </button>
                        </div>

                        <div className="filter-group">
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="language-select"
                            >
                                <option value="">All languages</option>
                                {availableLanguages.map(lang => (
                                    <option key={lang} value={lang}>
                                        {getLanguageFlag(lang)} {lang}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={verifiedFilter === null ? '' : verifiedFilter.toString()}
                                onChange={(e) => setVerifiedFilter(e.target.value === '' ? null : e.target.value === 'true')}
                                className="status-select"
                            >
                                <option value="">All verification status</option>
                                <option value="true">✓ Verified only</option>
                                <option value="false">⚠ Unverified only</option>
                            </select>

                            <select
                                value={reviewedFilter === null ? '' : reviewedFilter.toString()}
                                onChange={(e) => setReviewedFilter(e.target.value === '' ? null : e.target.value === 'true')}
                                className="status-select"
                            >
                                <option value="">All review status</option>
                                <option value="true">👁 Reviewed only</option>
                                <option value="false">📝 Unreviewed only</option>
                            </select>

                            <select
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                className="pagesize-select"
                            >
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                                <option value={100}>100 per page</option>
                            </select>
                        </div>
                    </form>

                    {/* Stats */}
                    <div className="stats-section">
                        <div className="stats-item">
                            <span className="stats-label">Total items:</span>
                            <span className="stats-value">{totalItems.toLocaleString()}</span>
                        </div>
                        <div className="stats-item">
                            <span className="stats-label">Page:</span>
                            <span className="stats-value">{currentPage} of {totalPages}</span>
                        </div>
                        <div className="stats-item">
                            <span className="stats-label">Items displayed:</span>
                            <span className="stats-value">{properties.length}</span>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="loading-section">
                        <div className="loading-spinner"></div>
                        <p>Loading properties...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="error-section">
                        <p>{error}</p>
                        <button onClick={loadProperties} className="retry-btn">
                            Retry
                        </button>
                    </div>
                )}

                {/* Lista Properties */}
                {!loading && !error && (
                    <div className="properties-list">
                        {properties.map((property) => (
                            <div key={property.key} className="property-card">
                                <div className="property-header">
                                    <h3 className="property-key">{property.key}</h3>
                                    <div className="property-dates">
                                        <span className="date-info">
                                            Created: {formatDate(property.insertDate)}
                                        </span>
                                        <span className="date-info">
                                            Updated: {formatDate(property.updateDate)}
                                        </span>
                                    </div>
                                </div>

                                <div className="property-values">
                                    {property.values.map((value, index) => {
                                        const editKey = getEditKey(property.key, value.language)
                                        const isSaving = savingValues[editKey] || false
                                        const editingValue = editingValues[editKey] || value

                                        return (
                                            <div key={index} className="value-row">
                                                <span className="language-flag">{getLanguageFlag(value.language)}</span>
                                                <span className="language-code">{value.language}</span>
                                                <textarea
                                                    value={editingValue.text}
                                                    onChange={(e) => updateEditingValue(property.key, value.language, 'text', e.target.value)}
                                                    onClick={(e) => autoResizeTextarea(e.target as HTMLTextAreaElement)}
                                                    onInput={(e) => autoResizeTextarea(e.target as HTMLTextAreaElement)}
                                                    className="edit-text-input"
                                                    rows={1}
                                                    disabled={isSaving}
                                                />
                                                <label className="flag-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingValue.isVerified}
                                                        onChange={(e) => updateEditingValue(property.key, value.language, 'isVerified', e.target.checked)}
                                                        disabled={isSaving}
                                                    />
                                                    <span>✓</span>
                                                </label>
                                                <label className="flag-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingValue.isReviewed}
                                                        onChange={(e) => updateEditingValue(property.key, value.language, 'isReviewed', e.target.checked)}
                                                        disabled={isSaving}
                                                    />
                                                    <span>👁</span>
                                                </label>
                                                <button
                                                    onClick={() => openCommentsModal(property.key, value.language, value.id)}
                                                    className="comments-btn"
                                                    title={`Comments (${(editingValue.comments || []).length})`}
                                                >
                                                    💬 ({(editingValue.comments || []).length})
                                                </button>
                                                <button
                                                    onClick={() => commitChanges(property.key, value.language)}
                                                    disabled={isSaving}
                                                    className="commit-btn"
                                                >
                                                    {isSaving ? '💾' : '💾'}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginazione */}
                {!loading && !error && totalPages > 1 && (
                    <div className="pagination-section">
                        {renderPagination()}
                        <div className="pagination-info">
                            Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems.toLocaleString()} items
                        </div>
                    </div>
                )}
            </div>

            {/* Comments Modal */}
            <CommentsModal
                isOpen={commentsModal.isOpen}
                onClose={closeCommentsModal}
                valueId={commentsModal.valueId}
                propertyKey={commentsModal.propertyKey}
                language={commentsModal.language}
                onCommentsUpdated={handleCommentsUpdated}
            />
        </div>
    )
}