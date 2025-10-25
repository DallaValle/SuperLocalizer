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
    const [editingValues, setEditingValues] = useState<{ [key: string]: PropertyValue }>({})
    const [savingValues, setSavingValues] = useState<{ [key: string]: boolean }>({})
    const [commentsModal, setCommentsModal] = useState<{
        isOpen: boolean
        propertyKey: string
        language: string
        comments: string[]
    }>({
        isOpen: false,
        propertyKey: '',
        language: '',
        comments: []
    })

    // Lingue disponibili (dall'esempio API)
    const availableLanguages = ['de-DE', 'it', 'fr', 'en', 'de-CH']

    useEffect(() => {
        loadProperties()
    }, [currentPage, pageSize, searchTerm, selectedLanguage])

    useEffect(() => {
        // Inizializza i valori di editing per tutte le proprietà
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
                ...(selectedLanguage && { language: selectedLanguage })
            }

            const response: PropertySearchResponse = await PropertyService.searchProperties(request)

            setProperties(response.items)
            setTotalPages(response.totalPages)
            setTotalItems(response.totalItems)
        } catch (err) {
            setError('Errore nel caricamento delle proprietà')
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
        setCurrentPage(1) // Reset alla prima pagina
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1) // Reset alla prima pagina
        loadProperties()
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
        return new Date(dateString).toLocaleDateString('it-IT', {
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

            // Aggiorna i dati locali
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
            setError('Errore durante il salvataggio')
        } finally {
            setSavingValues(prev => {
                const newState = { ...prev }
                delete newState[editKey]
                return newState
            })
        }
    }

    const openCommentsModal = (propertyKey: string, language: string, comments: string[]) => {
        setCommentsModal({
            isOpen: true,
            propertyKey,
            language,
            comments: [...comments]
        })
    }

    const closeCommentsModal = () => {
        setCommentsModal({
            isOpen: false,
            propertyKey: '',
            language: '',
            comments: []
        })
    }

    const updateComments = (comments: string[]) => {
        const { propertyKey, language } = commentsModal

        // Aggiorna i commenti nell'editing value
        const editKey = getEditKey(propertyKey, language)
        setEditingValues(prev => ({
            ...prev,
            [editKey]: {
                ...prev[editKey],
                comments: [...comments]
            }
        }))

        // Aggiorna anche la modal
        setCommentsModal(prev => ({
            ...prev,
            comments: [...comments]
        }))
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
                <h1>Gestione Traduzioni</h1>
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
                                placeholder="Cerca per chiave..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <button type="submit" className="search-btn">
                                🔍 Cerca
                            </button>
                        </div>

                        <div className="filter-group">
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="language-select"
                            >
                                <option value="">Tutte le lingue</option>
                                {availableLanguages.map(lang => (
                                    <option key={lang} value={lang}>
                                        {getLanguageFlag(lang)} {lang}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                className="pagesize-select"
                            >
                                <option value={10}>10 per pagina</option>
                                <option value={25}>25 per pagina</option>
                                <option value={50}>50 per pagina</option>
                                <option value={100}>100 per pagina</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* Statistiche */}
                <div className="stats-section">
                    <div className="stats-item">
                        <span className="stats-label">Totale elementi:</span>
                        <span className="stats-value">{totalItems.toLocaleString()}</span>
                    </div>
                    <div className="stats-item">
                        <span className="stats-label">Pagina:</span>
                        <span className="stats-value">{currentPage} di {totalPages}</span>
                    </div>
                    <div className="stats-item">
                        <span className="stats-label">Elementi visualizzati:</span>
                        <span className="stats-value">{properties.length}</span>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="loading-section">
                        <div className="loading-spinner"></div>
                        <p>Caricamento proprietà...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="error-section">
                        <p>{error}</p>
                        <button onClick={loadProperties} className="retry-btn">
                            Riprova
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
                                            Creato: {formatDate(property.insertDate)}
                                        </span>
                                        <span className="date-info">
                                            Aggiornato: {formatDate(property.updateDate)}
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
                                                <div className="language-info">
                                                    <span className="language-flag">
                                                        {getLanguageFlag(value.language)}
                                                    </span>
                                                    <span className="language-code">
                                                        {value.language}
                                                    </span>
                                                </div>

                                                <div className="translation-content">
                                                    <div className="editing-form">
                                                        <textarea
                                                            value={editingValue.text}
                                                            onChange={(e) => updateEditingValue(property.key, value.language, 'text', e.target.value)}
                                                            className="edit-text-input"
                                                            rows={2}
                                                            disabled={isSaving}
                                                        />

                                                        <div className="flags-container">
                                                            <label className="flag-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editingValue.isVerified}
                                                                    onChange={(e) => updateEditingValue(property.key, value.language, 'isVerified', e.target.checked)}
                                                                    disabled={isSaving}
                                                                />
                                                                <span>✓ Verificato</span>
                                                            </label>

                                                            <label className="flag-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editingValue.isReviewed}
                                                                    onChange={(e) => updateEditingValue(property.key, value.language, 'isReviewed', e.target.checked)}
                                                                    disabled={isSaving}
                                                                />
                                                                <span>👁 Revisionato</span>
                                                            </label>
                                                        </div>

                                                        <div className="edit-actions">
                                                            <button
                                                                onClick={() => openCommentsModal(property.key, value.language, editingValue.comments || [])}
                                                                className="comments-btn"
                                                                title={`Commenti (${(editingValue.comments || []).length})`}
                                                            >
                                                                💬 Commenti ({(editingValue.comments || []).length})
                                                            </button>
                                                            <button
                                                                onClick={() => commitChanges(property.key, value.language)}
                                                                disabled={isSaving}
                                                                className="commit-btn"
                                                            >
                                                                {isSaving ? '💾 Salvando...' : '💾 Commit'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
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
                            Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} di {totalItems.toLocaleString()} elementi
                        </div>
                    </div>
                )}
            </div>

            {/* Comments Modal */}
            <CommentsModal
                isOpen={commentsModal.isOpen}
                onClose={closeCommentsModal}
                comments={commentsModal.comments}
                onUpdateComments={updateComments}
                propertyKey={commentsModal.propertyKey}
                language={commentsModal.language}
            />
        </div>
    )
}