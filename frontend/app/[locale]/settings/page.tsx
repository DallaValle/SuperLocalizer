'use client'

import { SettingService } from '../../services/SettingService'
import { LocaleService } from '../../services/LocaleService'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import './Actions.css'
import { User, SnapshotItem } from '../../types/domain'

interface LanguageOption {
    code: string;
    name: string;
    selected: boolean;
}

interface ImportStatus {
    isLoading: boolean;
    message: string;
    error: string | null;
}

interface ExportStatus {
    isLoading: boolean;
    error: string | null;
    message?: string | null;
}

interface SnapshotStatus {
    isLoading: boolean;
    message: string | null;
    error: string | null;
}

interface SnapshotsStatus {
    isLoading: boolean;
    snapshots: SnapshotItem[];
    error: string | null;
}

interface RollbackStatus {
    isLoading: boolean;
    error: string | null;
    message?: string | null;
}



export default function ActionsPage() {
    const { data: session } = useSession()
    const user = session?.user as User || null
    const [settingService, setSettingService] = useState<SettingService | null>(null)

    // Import states
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [importLanguage, setImportLanguage] = useState<string>('en')
    const [importStatus, setImportStatus] = useState<ImportStatus>({
        isLoading: false,
        message: '',
        error: null
    })

    // Export states
    const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([])
    const [exportStatus, setExportStatus] = useState<ExportStatus>({
        isLoading: false,
        error: null,
        message: null
    })

    // Snapshot states
    const [snapshotStatus, setSnapshotStatus] = useState<SnapshotStatus>({
        isLoading: false,
        message: null,
        error: null
    })

    // Snapshots list states
    const [snapshotsStatus, setSnapshotsStatus] = useState<SnapshotsStatus>({
        isLoading: false,
        snapshots: [],
        error: null
    })

    // Rollback states
    const [rollbackStatus, setRollbackStatus] = useState<RollbackStatus>({
        isLoading: false,
        error: null,
        message: null
    })

    useEffect(() => {
        if (user?.mainProjectId) {
            setSettingService(new SettingService(user.mainProjectId))
        }
    }, [user])

    useEffect(() => {
        const loadAvailableLanguages = async () => {
            if (user?.companyId && user?.mainProjectId) {
                try {
                    const languages = await LocaleService.getSupportedLanguages(user.companyId, user.mainProjectId)
                    setAvailableLanguages(languages.map(lang => ({
                        code: lang.code,
                        name: lang.name,
                        selected: false
                    })))
                } catch (error) {
                    console.error('Failed to load available languages:', error)
                    // Fallback to default languages
                    const defaultLanguages = ['en', 'fr', 'de-DE', 'de-CH', 'it']
                    setAvailableLanguages(defaultLanguages.map(code => ({
                        code,
                        name: LocaleService.getLanguageName(code),
                        selected: false
                    })))
                }
            }
        }

        loadAvailableLanguages()
    }, [user?.companyId, user?.mainProjectId])



    const handleLanguageToggle = (languageCode: string) => {
        setAvailableLanguages(prev =>
            prev.map(lang =>
                lang.code === languageCode
                    ? { ...lang, selected: !lang.selected }
                    : lang
            )
        )
    }

    const handleSelectAllLanguages = () => {
        const allSelected = availableLanguages.every(lang => lang.selected)
        setAvailableLanguages(prev =>
            prev.map(lang => ({ ...lang, selected: !allSelected }))
        )
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        setSelectedFile(file)

        // Clear previous status when selecting a new file
        if (file) {
            setImportStatus({ isLoading: false, message: '', error: null })
        }
    }

    const handleImport = async () => {
        if (!selectedFile || !settingService) {
            setImportStatus({
                isLoading: false,
                message: '',
                error: 'Please select a file first'
            })
            return
        }

        setImportStatus({ isLoading: true, message: 'Importing file...', error: null })

        try {
            const result = await settingService.importFile(selectedFile, importLanguage)
            setImportStatus({
                isLoading: false,
                message: result || 'Import completed successfully',
                error: null
            })
            // Clear the file input after successful import
            setSelectedFile(null)
            const fileInput = document.getElementById('file-input') as HTMLInputElement
            if (fileInput) {
                fileInput.value = ''
            }
        } catch (error) {
            setImportStatus({
                isLoading: false,
                message: '',
                error: error instanceof Error ? error.message : 'Import failed'
            })
        }
    }

    const handleExport = async () => {
        if (!settingService) {
            setExportStatus({ isLoading: false, error: 'Service not available', message: null })
            return
        }

        const selectedLanguages = availableLanguages.filter(lang => lang.selected)
        if (selectedLanguages.length === 0) {
            setExportStatus({
                isLoading: false,
                error: 'Please select at least one language to export',
                message: null
            })
            return
        }

        setExportStatus({ isLoading: true, error: null, message: null })

        try {
            const languageCodes = selectedLanguages.map(lang => lang.code)
            const exports = await settingService.exportFiles(languageCodes)

            // Download each file
            exports.forEach(({ language, blob }) => {
                const filename = `localization_${language}.json`
                SettingService.downloadBlob(blob, filename)
            })

            setExportStatus({
                isLoading: false,
                error: null,
                message: `Successfully exported ${exports.length} file(s)`
            })
        } catch (error) {
            setExportStatus({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Export failed',
                message: null
            })
        }
    }

    const handleSaveSnapshot = async () => {
        if (!settingService) return

        setSnapshotStatus({ isLoading: true, message: null, error: null })

        try {
            const result = await settingService.saveSnapshot()
            setSnapshotStatus({
                isLoading: false,
                message: result || 'Snapshot saved successfully',
                error: null
            })
        } catch (error) {
            setSnapshotStatus({
                isLoading: false,
                message: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    const handleLoadSnapshots = async () => {
        if (!settingService) return

        setSnapshotsStatus({ isLoading: true, snapshots: [], error: null })

        try {
            const snapshots = await settingService.getSnapshots(10)
            setSnapshotsStatus({
                isLoading: false,
                snapshots,
                error: null
            })
        } catch (error) {
            setSnapshotsStatus({
                isLoading: false,
                snapshots: [],
                error: error instanceof Error ? error.message : 'Failed to load snapshots'
            })
        }
    }

    const handleRollback = async (snapshotId: string) => {
        if (!settingService) return

        setRollbackStatus({ isLoading: true, error: null })

        try {
            const result = await settingService.rollbackToSnapshot(snapshotId)
            setRollbackStatus({ isLoading: false, error: null, message: result || 'Rollback completed successfully' })
            // Reload snapshots after rollback
            await handleLoadSnapshots()
        } catch (error) {
            setRollbackStatus({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Rollback failed',
                message: null
            })
        }
    }

    return (
        <div className="actions-page">
            <main className="actions-main">
                <div className="page-title">
                    <h1>Import & Export Actions</h1>
                    <p>Manage your localization files - import new translations or export current ones</p>
                </div>

                <div className="actions-grid">
                    {/* Import Section */}
                    <div className="action-card">
                        <div className="action-header">
                            <h2>📥 Import Localization File</h2>
                            <p>Upload a JSON localization file to import translations</p>
                        </div>

                        <div className="action-content">
                            <div className="form-group">
                                <label htmlFor="language-input">Language Code:</label>
                                <input
                                    id="language-input"
                                    type="text"
                                    value={importLanguage}
                                    onChange={(e) => setImportLanguage(e.target.value)}
                                    className="language-input"
                                    placeholder="e.g., en, fr, de-CH"
                                    disabled={importStatus.isLoading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="file-input">Select File:</label>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileSelect}
                                    className="file-input"
                                    disabled={importStatus.isLoading}
                                />
                                {selectedFile && (
                                    <div className="file-info">
                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={!selectedFile || importStatus.isLoading}
                                className="action-btn import-btn"
                            >
                                {importStatus.isLoading ? 'Importing...' : 'Import File'}
                            </button>

                            {importStatus.message && (
                                <div className="status-message success">
                                    {importStatus.message}
                                </div>
                            )}

                            {importStatus.error && (
                                <div className="status-message error">
                                    {importStatus.error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Export Section */}
                    <div className="action-card">
                        <div className="action-header">
                            <h2>📤 Export Localization Files</h2>
                            <p>Download current translations as JSON files for selected languages</p>
                        </div>

                        <div className="action-content">
                            <div className="form-group">
                                <div className="language-selection-header">
                                    <label>Select Languages to Export:</label>
                                    <button
                                        onClick={handleSelectAllLanguages}
                                        disabled={exportStatus.isLoading}
                                        className="select-all-btn"
                                    >
                                        {availableLanguages.every(lang => lang.selected) ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="languages-grid">
                                    {availableLanguages.map((language) => (
                                        <div key={language.code} className="language-checkbox">
                                            <input
                                                type="checkbox"
                                                id={`export-lang-${language.code}`}
                                                checked={language.selected}
                                                onChange={() => handleLanguageToggle(language.code)}
                                                disabled={exportStatus.isLoading}
                                            />
                                            <label htmlFor={`export-lang-${language.code}`}>
                                                <span className="language-flag">{LocaleService.getLanguageFlag(language.code)}</span>
                                                <span className="language-code">{language.code}</span>
                                                <span className="language-name">{language.name}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleExport}
                                disabled={exportStatus.isLoading || availableLanguages.filter(lang => lang.selected).length === 0}
                                className="action-btn export-btn"
                            >
                                {exportStatus.isLoading
                                    ? 'Exporting...'
                                    : `Export ${availableLanguages.filter(lang => lang.selected).length} File(s)`
                                }
                            </button>

                            {exportStatus.message && (
                                <div className="status-message success">
                                    {exportStatus.message}
                                </div>
                            )}

                            {exportStatus.error && (
                                <div className="status-message error">
                                    {exportStatus.error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Snapshot Section */}
                    <div className="action-card">
                        <div className="action-header">
                            <h2>💾 Save Snapshot</h2>
                            <p>Create a backup snapshot of the current project state</p>
                        </div>

                        <div className="action-content">
                            <button
                                onClick={handleSaveSnapshot}
                                disabled={snapshotStatus.isLoading}
                                className="action-btn snapshot-btn"
                            >
                                {snapshotStatus.isLoading ? 'Saving...' : 'Save Snapshot'}
                            </button>

                            {snapshotStatus.message && (
                                <div className="status-message success">
                                    {snapshotStatus.message}
                                </div>
                            )}

                            {snapshotStatus.error && (
                                <div className="status-message error">
                                    {snapshotStatus.error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Snapshots List & Rollback Section */}
                    <div className="action-card">
                        <div className="action-header">
                            <h2>📋 Snapshots & Rollback</h2>
                            <p>View saved snapshots and rollback to previous states</p>
                        </div>

                        <div className="action-content">
                            <button
                                onClick={handleLoadSnapshots}
                                disabled={snapshotsStatus.isLoading}
                                className="action-btn snapshot-btn"
                            >
                                {snapshotsStatus.isLoading ? 'Loading...' : 'Load Snapshots'}
                            </button>

                            {snapshotsStatus.error && (
                                <div className="status-message error">
                                    {snapshotsStatus.error}
                                </div>
                            )}

                            {rollbackStatus.error && (
                                <div className="status-message error">
                                    {rollbackStatus.error}
                                </div>
                            )}

                            {rollbackStatus.message && (
                                <div className="status-message success">
                                    {rollbackStatus.message}
                                </div>
                            )}

                            {snapshotsStatus.snapshots.length > 0 && (
                                <div className="snapshots-list">
                                    <h3>Available Snapshots:</h3>
                                    <div className="snapshots-container">
                                        {snapshotsStatus.snapshots.map(snapshot => (
                                            <div key={snapshot.id} className="snapshot-item">
                                                <div className="snapshot-info">
                                                    <div className="snapshot-date">
                                                        {new Date(snapshot.insertDate).toLocaleString()}
                                                    </div>
                                                    {snapshot.description && (
                                                        <div className="snapshot-description">
                                                            {snapshot.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRollback(snapshot.id)}
                                                    disabled={rollbackStatus.isLoading}
                                                    className="action-btn rollback-btn"
                                                >
                                                    {rollbackStatus.isLoading ? 'Rolling back...' : 'Rollback'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}