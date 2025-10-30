'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { PropertyService, type Property, type PropertySearchRequest, type PropertySearchResponse, type PropertyValue, type PropertyValueUpdateRequest } from '../services/PropertyService'
import CommentsModal from './CommentsModal'
import HistoryModal from './HistoryModal'
import './Properties.css'

export default function PropertiesPage() {
    const { logout } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
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
    const [orderBy, setOrderBy] = useState<'Key' | 'InsertDate' | 'UpdateDate'>('Key')
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc')
    const [isInitialized, setIsInitialized] = useState(false)
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
    const [historyModal, setHistoryModal] = useState<{
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
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    const availableLanguages = ['de-DE', 'it', 'fr', 'en', 'de-CH']

    // Helper function
    const getEditKey = (propertyKey: string, language: string) => {
        return `${propertyKey}|${language}`
    }

    // Auto-save functionality
    const autoSaveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
    const editingValuesRef = useRef<{ [key: string]: PropertyValue }>({})

    // Update ref whenever editingValues changes
    useEffect(() => {
        editingValuesRef.current = editingValues
    }, [editingValues])

    const debouncedAutoSave = useCallback((propertyKey: string, language: string, delay: number = 1000) => {
        const editKey = getEditKey(propertyKey, language)

        // Clear existing timeout for this field
        if (autoSaveTimeoutRef.current[editKey]) {
            clearTimeout(autoSaveTimeoutRef.current[editKey])
        }

        // Set new timeout
        autoSaveTimeoutRef.current[editKey] = setTimeout(() => {
            commitChanges(propertyKey, language)
            delete autoSaveTimeoutRef.current[editKey]
        }, delay)
    }, [])

    const immediateAutoSave = useCallback((propertyKey: string, language: string) => {
        const editKey = getEditKey(propertyKey, language)

        // Clear any pending debounced save
        if (autoSaveTimeoutRef.current[editKey]) {
            clearTimeout(autoSaveTimeoutRef.current[editKey])
            delete autoSaveTimeoutRef.current[editKey]
        }

        // Save immediately
        setTimeout(() => commitChanges(propertyKey, language), 100)
    }, [])

    // Toast notification function
    const showToast = useCallback((message: string) => {
        setToastMessage(message)
        setTimeout(() => setToastMessage(null), 3000) // Auto-hide after 3 seconds
    }, [])

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

    // Function to update URL with current filters
    const updateUrlWithFilters = () => {
        const params = new URLSearchParams()

        if (currentPage > 1) params.set('page', currentPage.toString())
        if (pageSize !== 10) params.set('size', pageSize.toString())
        if (searchTerm) params.set('search', searchTerm)
        if (selectedLanguage) params.set('language', selectedLanguage)
        if (verifiedFilter !== null) params.set('verified', verifiedFilter.toString())
        if (reviewedFilter !== null) params.set('reviewed', reviewedFilter.toString())
        if (orderBy !== 'Key') params.set('orderBy', orderBy)
        if (orderDirection !== 'asc') params.set('orderDirection', orderDirection)

        const queryString = params.toString()
        const newUrl = queryString ? `/properties?${queryString}` : '/properties'

        router.push(newUrl, { scroll: false })
    }

    // Initialize filters from URL parameters
    useEffect(() => {
        const page = searchParams.get('page')
        const size = searchParams.get('size')
        const search = searchParams.get('search')
        const language = searchParams.get('language')
        const verified = searchParams.get('verified')
        const reviewed = searchParams.get('reviewed')
        const orderByParam = searchParams.get('orderBy')
        const orderDirectionParam = searchParams.get('orderDirection')

        if (page) setCurrentPage(parseInt(page, 10))
        if (size) setPageSize(parseInt(size, 10))
        if (search) setSearchTerm(search)
        if (language) setSelectedLanguage(language)
        if (verified) setVerifiedFilter(verified === 'true')
        if (reviewed) setReviewedFilter(reviewed === 'true')
        if (orderByParam && ['Key', 'InsertDate', 'UpdateDate'].includes(orderByParam)) {
            setOrderBy(orderByParam as 'Key' | 'InsertDate' | 'UpdateDate')
        }
        if (orderDirectionParam && ['asc', 'desc'].includes(orderDirectionParam)) {
            setOrderDirection(orderDirectionParam as 'asc' | 'desc')
        }

        setIsInitialized(true)
    }, [searchParams])

    useEffect(() => {
        if (isInitialized) {
            loadProperties()
        }
    }, [currentPage, pageSize, searchTerm, selectedLanguage, verifiedFilter, reviewedFilter, orderBy, orderDirection, isInitialized])

    // Update URL when filters change (but not during initialization)
    useEffect(() => {
        if (isInitialized) {
            updateUrlWithFilters()
        }
    }, [currentPage, pageSize, searchTerm, selectedLanguage, verifiedFilter, reviewedFilter, orderBy, orderDirection, isInitialized, router])

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(autoSaveTimeoutRef.current).forEach(timeout => {
                clearTimeout(timeout)
            })
            autoSaveTimeoutRef.current = {}
        }
    }, [])

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
                ...(reviewedFilter !== null && { isReviewed: reviewedFilter }),
                orderBy,
                orderDirection
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
        setOrderBy('Key')
        setOrderDirection('asc')
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

    const updateEditingValue = (propertyKey: string, language: string, field: keyof PropertyValue, value: any) => {
        const editKey = getEditKey(propertyKey, language)
        setEditingValues(prev => ({
            ...prev,
            [editKey]: {
                ...prev[editKey],
                [field]: value
            }
        }))

        // Auto-save logic
        if (field === 'text') {
            // Debounced auto-save for text changes
            console.log('Scheduling debounced auto-save for', propertyKey, language)
            debouncedAutoSave(propertyKey, language, 1000)
        } else if (field === 'isVerified' || field === 'isReviewed') {
            // Immediate auto-save for checkbox changes
            console.log('Scheduling immediate auto-save for', propertyKey, language, field)
            immediateAutoSave(propertyKey, language)
        }
    }

    const commitChanges = async (propertyKey: string, language: string) => {
        const editKey = getEditKey(propertyKey, language)
        const editingValue = editingValuesRef.current[editKey]

        console.log('commitChanges called for', propertyKey, language, editingValue)

        if (!editingValue) {
            console.log('No editing value found for', editKey)
            return
        }

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

            // Show success toast
            showToast('Saved')

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

    const openHistoryModal = (propertyKey: string, language: string, valueId: string) => {
        setHistoryModal({
            isOpen: true,
            propertyKey,
            language,
            valueId
        })
    }

    const closeHistoryModal = () => {
        setHistoryModal({
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
                <div className="header-title">
                    <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="header-logo" />
                </div>
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
                        </div>

                        <div className="filter-group">
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
                                value={orderBy}
                                onChange={(e) => setOrderBy(e.target.value as 'Key' | 'InsertDate' | 'UpdateDate')}
                                className="sort-select"
                            >
                                <option value="Key">Sort by Key</option>
                                <option value="InsertDate">Sort by Insert Date</option>
                                <option value="UpdateDate">Sort by Update Date</option>
                            </select>

                            <select
                                value={orderDirection}
                                onChange={(e) => setOrderDirection(e.target.value as 'asc' | 'desc')}
                                className="sort-select"
                            >
                                <option value="asc">↑ Ascending</option>
                                <option value="desc">↓ Descending</option>
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
                                                    onClick={() => openCommentsModal(property.key, value.language, `${property.key}_${value.language}`)}
                                                    className="comments-btn"
                                                    title={`Comments (${(editingValue.comments || []).length})`}
                                                >
                                                    💬{/* ({(editingValue.comments || []).length}) */}
                                                </button>
                                                <button
                                                    onClick={() => openHistoryModal(property.key, value.language, `${property.key}_${value.language}`)}
                                                    className="history-btn"
                                                    title="View history"
                                                >
                                                    🕓
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

            {/* History Modal */}
            <HistoryModal
                isOpen={historyModal.isOpen}
                onClose={closeHistoryModal}
                valueId={historyModal.valueId}
                propertyKey={historyModal.propertyKey}
                language={historyModal.language}
            />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="toast-notification">
                    {toastMessage}
                </div>
            )}
        </div>
    )
}