'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PropertyService, CreatePropertyRequest, CreateLanguageRequest } from '../../services/PropertyService'
import CommentsModal from './CommentsModal'
import HistoryModal from './HistoryModal'
import ManagementTab from './ManagementTab'
import './Properties.css'
import { Property, PropertySearchRequest, PropertySearchResponse, PropertyValue, PropertyValueUpdateRequest, User } from '../../types/domain'
import { ProjectService } from '../../services/ProjectService'

function PropertiesContent() {
    const { data: session } = useSession()
    const user = session?.user as User || null
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
    const [commentsModal, setCommentsModal] = useState<{
        isOpen: boolean
        propertyKey: string
        language: string
        valueKey: string
    }>({
        isOpen: false,
        propertyKey: '',
        language: '',
        valueKey: ''
    })
    const [historyModal, setHistoryModal] = useState<{
        isOpen: boolean
        propertyKey: string
        language: string
        valueKey: string
    }>({
        isOpen: false,
        propertyKey: '',
        language: '',
        valueKey: ''
    })
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'search' | 'management'>('search')
    const [bulkVerified, setBulkVerified] = useState<boolean | null>(null)
    const [bulkReviewed, setBulkReviewed] = useState<boolean | null>(null)
    const [newPropertyName, setNewPropertyName] = useState('')
    const [actionError, setActionError] = useState<string | null>(null)
    const [isManagementExpanded, setIsManagementExpanded] = useState(false)

    // Helper function
    const getEditKey = (propertyKey: string, language: string) => {
        return `${propertyKey}|${language}`
    }

    // Auto-save functionality - FIXED VERSION
    const autoSaveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
    const pendingChangesRef = useRef<{ [key: string]: PropertyValue }>({})
    // Track last saved values to avoid duplicate PATCH calls
    const lastSavedValuesRef = useRef<{ [key: string]: PropertyValue }>({})
    // Track in-flight saves to prevent concurrent PATCHes for the same field
    const inFlightSaveRef = useRef<{ [key: string]: boolean }>({})

    const debouncedAutoSave = useCallback((propertyKey: string, language: string, value: PropertyValue, delay: number = 2000) => {
        // Don't save if user is not ready
        if (!user || user.mainProjectId == null) {
            console.log('debouncedAutoSave: User not ready, skipping save')
            return
        }

        const editKey = getEditKey(propertyKey, language)

        // Store the latest value for this field
        pendingChangesRef.current[editKey] = { ...value }

        // Clear existing timeout for this field
        if (autoSaveTimeoutRef.current[editKey]) {
            clearTimeout(autoSaveTimeoutRef.current[editKey])
        }

        // Set new timeout
        autoSaveTimeoutRef.current[editKey] = setTimeout(() => {
            const latestValue = pendingChangesRef.current[editKey]
            if (latestValue) {
                commitChanges(propertyKey, language, latestValue)
                delete pendingChangesRef.current[editKey]
            }
            delete autoSaveTimeoutRef.current[editKey]
        }, delay)
    }, [user])

    const immediateAutoSave = useCallback((propertyKey: string, language: string, value: PropertyValue) => {
        // Don't save if user is not ready
        if (!user || user.mainProjectId == null) {
            console.log('immediateAutoSave: User not ready, skipping save')
            return
        }

        const editKey = getEditKey(propertyKey, language)

        // Clear any pending debounced save
        if (autoSaveTimeoutRef.current[editKey]) {
            clearTimeout(autoSaveTimeoutRef.current[editKey])
            delete autoSaveTimeoutRef.current[editKey]
        }

        // Clear pending changes since we're saving immediately
        delete pendingChangesRef.current[editKey]

        // Save immediately
        setTimeout(() => commitChanges(propertyKey, language, value), 100)
    }, [user])

    // Toast notification function
    const showToast = useCallback((message: string) => {
        setToastMessage(message)
        setTimeout(() => setToastMessage(null), 3000)
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
        if (isInitialized && user && user.mainProjectId) {
            loadProperties()
        }
    }, [currentPage, pageSize, searchTerm, selectedLanguage, verifiedFilter, reviewedFilter, orderBy, orderDirection, isInitialized, user])

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
            pendingChangesRef.current = {}
        }
    }, [])

    useEffect(() => {
        const newEditingValues: { [key: string]: PropertyValue } = {}
        properties.forEach(property => {
            property.values.forEach(value => {
                const editKey = getEditKey(property.key, value.language)
                newEditingValues[editKey] = { ...value }
                // Initialize last-saved value from loaded properties
                lastSavedValuesRef.current[editKey] = { ...value }
            })
        })
        setEditingValues(newEditingValues)
    }, [properties])

    const loadProperties = async () => {
        // Early return if user is not ready or mainProjectId is not set
        if (!user || user.mainProjectId == null) {
            console.log('loadProperties: User or mainProjectId not available', { user, mainProjectId: user?.mainProjectId })
            return
        }

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

            const response: PropertySearchResponse = await new PropertyService(user.mainProjectId).searchProperties(request)

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
        if (user && user.mainProjectId) {
            loadProperties()
        }
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

    // Updated commitChanges function to accept value parameter
    const commitChanges = async (propertyKey: string, language: string, valueToSave?: PropertyValue) => {
        const editKey = getEditKey(propertyKey, language)
        const editingValue = valueToSave || editingValues[editKey]

        console.log('commitChanges called for', propertyKey, language, editingValue)

        if (!editingValue) {
            console.log('No editing value found for', editKey)
            return
        }

        // Prevent duplicate saves: if value is identical to last saved, skip
        const lastSaved = lastSavedValuesRef.current[editKey]
        if (lastSaved && lastSaved.text === editingValue.text && lastSaved.isVerified === editingValue.isVerified && lastSaved.isReviewed === editingValue.isReviewed) {
            console.log('commitChanges: No changes since last save for', editKey)
            return
        }

        // Prevent concurrent saves for same field
        if (inFlightSaveRef.current[editKey]) {
            console.log('commitChanges: Save already in progress for', editKey)
            return
        }
        inFlightSaveRef.current[editKey] = true

        setSavingValues(prev => ({ ...prev, [editKey]: true }))

        try {
            const updateRequest: PropertyValueUpdateRequest = {
                text: editingValue.text,
                isVerified: editingValue.isVerified,
                isReviewed: editingValue.isReviewed,
                key: propertyKey,
                language: language
            }
            if (user?.mainProjectId == null) throw new Error("User's main project ID is not set.")

            await new PropertyService(user.mainProjectId).updatePropertyValue(updateRequest)

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

            // Update last-saved after successful save
            lastSavedValuesRef.current[editKey] = { ...editingValue }

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
            // Mark in-flight save as finished
            inFlightSaveRef.current[editKey] = false
        }
    }

    // Updated updateEditingValue function
    const updateEditingValue = (propertyKey: string, language: string, field: keyof PropertyValue, value: any) => {
        const editKey = getEditKey(propertyKey, language)

        setEditingValues(prev => {
            const currentValue = prev[editKey]
            if (!currentValue) {
                console.error('No current value found for editKey:', editKey)
                return prev
            }

            const updatedValue: PropertyValue = {
                ...currentValue,
                [field]: value
            }

            // Use setTimeout to ensure auto-save happens after state update
            setTimeout(() => {
                if (field === 'text') {
                    // Debounced auto-save for text changes
                    console.log('Scheduling debounced auto-save for', propertyKey, language)
                    debouncedAutoSave(propertyKey, language, updatedValue, 1000)
                } else if (field === 'isVerified' || field === 'isReviewed') {
                    // Immediate auto-save for checkbox changes
                    console.log('Scheduling immediate auto-save for', propertyKey, language, field)
                    immediateAutoSave(propertyKey, language, updatedValue)
                }
            }, 0)

            return {
                ...prev,
                [editKey]: updatedValue
            }
        })
    }

    const openCommentsModal = (propertyKey: string, language: string, valueKey: string) => {
        setCommentsModal({
            isOpen: true,
            propertyKey,
            language,
            valueKey
        })
    }

    const closeCommentsModal = () => {
        setCommentsModal({
            isOpen: false,
            propertyKey: '',
            language: '',
            valueKey: ''
        })
    }

    const openHistoryModal = (propertyKey: string, language: string, valueKey: string) => {
        setHistoryModal({
            isOpen: true,
            propertyKey,
            language,
            valueKey
        })
    }

    const closeHistoryModal = () => {
        setHistoryModal({
            isOpen: false,
            propertyKey: '',
            language: '',
            valueKey: ''
        })
    }

    // Management tab functions
    const handleCreateProperty = async (request: CreatePropertyRequest) => {
        if (!user?.mainProjectId || !user?.companyId) {
            throw new Error("User's main project ID or company ID is not set.")
        }

        await new PropertyService(user.mainProjectId).createProperty(request)
        showToast('Property created successfully!')
        // Reload properties to show the new one
        await loadProperties()
    }

    const handleCreateLanguage = async (request: CreateLanguageRequest) => {
        if (!user?.mainProjectId || !user?.companyId) {
            throw new Error("User's main project ID or company ID is not set.")
        }

        await new ProjectService().createLanguage(user.companyId, user.mainProjectId, request)
        showToast('Language created successfully!')
        // Reload properties to show the new language
        await loadProperties()
    }

    const handleBulkUpdateFlags = async () => {
        if (bulkVerified === null && bulkReviewed === null) {
            setActionError('Please select at least one flag to update')
            return;
        }

        if (!user?.mainProjectId) {
            throw new Error("User's main project ID is not set.")
        }

        try {
            // Create current search request
            const searchRequest: PropertySearchRequest = {
                page: currentPage,
                size: pageSize,
                ...(searchTerm && { searchTerm }),
                ...(selectedLanguage && { language: selectedLanguage }),
                ...(verifiedFilter !== null && { isVerified: verifiedFilter }),
                ...(reviewedFilter !== null && { isReviewed: reviewedFilter }),
                orderBy,
                orderDirection
            }

            await new PropertyService(user.mainProjectId).bulkUpdateFlags(searchRequest, bulkVerified, bulkReviewed)
            showToast('Flags updated successfully!')

            // Reset the bulk flag selections
            setBulkVerified(null)
            setBulkReviewed(null)

            // Reload properties to show the updated flags
            await loadProperties()
        } catch (error) {
            console.error('Error updating flags:', error)
            setActionError('Error updating flags. Please try again.')
        }
    }

    const handleCreatePropertyQuick = async () => {
        if (!newPropertyName.trim()) {
            setActionError('Property name is required')
            return;
        }

        if (!user?.mainProjectId) {
            throw new Error("User's main project ID is not set.")
        }

        try {
            // clear previous action errors
            if (actionError) setActionError(null)
            // Get all available languages from the LANGUAGES constant
            const { LANGUAGES } = await import('../../types/domain');

            const propertyKey = newPropertyName.trim();

            const request: CreatePropertyRequest = {
                key: propertyKey,
                values: LANGUAGES.map(language => ({
                    propertyKey: propertyKey, // Add the propertyKey field required by backend
                    language,
                    text: '', // Empty text, users will fill it in later
                    isVerified: false,
                    isReviewed: false,
                    insertDate: new Date().toISOString(),
                    updateDate: new Date().toISOString(),
                    comments: []
                }))
            };

            await new PropertyService(user.mainProjectId).createProperty(request);
            showToast(`Property "${newPropertyName}" created successfully!`);

            // Reset the property name input
            setNewPropertyName('');

            // Reload properties to show the new one
            await loadProperties();
        } catch (error) {
            console.error('Error creating property:', error);
            setActionError('Error creating property. Please try again.')
        }
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
            <div className="properties-content">
                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button
                        className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        🔍 Search & View Properties
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
                        onClick={() => setActiveTab('management')}
                    >
                        ⚙️ Languages Management
                    </button>
                </div>

                {/* Search Tab Content */}
                {activeTab === 'search' && (
                    <>
                        {/* Filters */}
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
                                    <button type="button" onClick={clearFilters} className="clear-btn">
                                        Clear
                                    </button>
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
                                    <span className="stats-value">{(totalItems ?? 0).toLocaleString()}</span>
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

                        {/* Property Management & Bulk Updates */}
                        <div className="bulk-update-section">
                            <div className="bulk-update-header" onClick={() => setIsManagementExpanded(!isManagementExpanded)}>
                                <span className="management-title">⚙️ Manage Properties</span>
                                <span className={`expand-icon ${isManagementExpanded ? 'expanded' : ''}`}>▼</span>
                            </div>

                            {isManagementExpanded && (
                                <div className="management-content">
                                    <div className="section-row">
                                        {/* Create Property Section */}
                                        <div className="create-property-group">
                                            <h4 className="action-title">➕ Create Property</h4>
                                            <div className="property-creation-controls">
                                                <input
                                                    placeholder="Property key (e.g., button.submit)"
                                                    className="property-name-input"
                                                    type="text"
                                                    value={newPropertyName}
                                                    onChange={(e) => {
                                                        setNewPropertyName(e.target.value)
                                                        if (actionError) setActionError(null)
                                                    }}
                                                    disabled={loading}
                                                />
                                                <button
                                                    className="create-property-btn"
                                                    onClick={handleCreatePropertyQuick}
                                                    disabled={loading || !newPropertyName.trim()}
                                                >
                                                    {loading ? 'Creating...' : 'Create Property'}
                                                </button>

                                                {actionError && (
                                                    <div className="error-section" role="alert">
                                                        {actionError}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bulk Flag Update Section */}
                                        <div className="bulk-flags-group">
                                            <h4 className="action-title">📝 Bulk Update Flags</h4>
                                            <div className="bulk-flag-controls">
                                                <div className="bulk-flag-group">
                                                    <label htmlFor="bulkVerifiedSelect" className="bulk-flag-label">
                                                        Verified Status
                                                    </label>
                                                    <select
                                                        id="bulkVerifiedSelect"
                                                        className="bulk-flag-select"
                                                        value={bulkVerified === null ? '' : bulkVerified.toString()}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setBulkVerified(value === '' ? null : value === 'true');
                                                            if (actionError) setActionError(null)
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        <option value="">No change</option>
                                                        <option value="true">✓ Set as Verified</option>
                                                        <option value="false">⚠ Set as Not Verified</option>
                                                    </select>
                                                </div>

                                                <div className="bulk-flag-group">
                                                    <label htmlFor="bulkReviewedSelect" className="bulk-flag-label">
                                                        Reviewed Status
                                                    </label>
                                                    <select
                                                        id="bulkReviewedSelect"
                                                        className="bulk-flag-select"
                                                        value={bulkReviewed === null ? '' : bulkReviewed.toString()}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setBulkReviewed(value === '' ? null : value === 'true');
                                                            if (actionError) setActionError(null)
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        <option value="">No change</option>
                                                        <option value="true">👁 Set as Reviewed</option>
                                                        <option value="false">📝 Set as Not Reviewed</option>
                                                    </select>
                                                </div>

                                                <button
                                                    className="bulk-update-btn"
                                                    onClick={handleBulkUpdateFlags}
                                                    disabled={loading || (bulkVerified === null && bulkReviewed === null)}
                                                >
                                                    {loading ? 'Updating...' : 'Update Flags'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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

                        {/* Properties */}
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

                        {/* Pagination */}
                        {!loading && !error && totalPages > 1 && (
                            <div className="pagination-section">
                                {renderPagination()}
                                <div className="pagination-info">
                                    Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems ?? 0)} of {(totalItems ?? 0).toLocaleString()} items
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Management Tab Content */}
                {activeTab === 'management' && (
                    <ManagementTab
                        onCreateProperty={handleCreateProperty}
                        onCreateLanguage={handleCreateLanguage}
                        loading={loading}
                    />
                )}
            </div>

            {/* Comments Modal */}
            <CommentsModal
                isOpen={commentsModal.isOpen}
                onClose={closeCommentsModal}
                valueKey={commentsModal.valueKey}
                propertyKey={commentsModal.propertyKey}
                language={commentsModal.language}
                onCommentsUpdated={handleCommentsUpdated}
            />

            {/* History Modal */}
            <HistoryModal
                isOpen={historyModal.isOpen}
                onClose={closeHistoryModal}
                valueKey={historyModal.valueKey}
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

function PropertiesPageFallback() {
    return (
        <div className="properties-container">
            <div className="loading-section">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        </div>
    )
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={<PropertiesPageFallback />}>
            <PropertiesContent />
        </Suspense>
    )
}