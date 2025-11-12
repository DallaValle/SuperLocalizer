import React, { useState } from 'react';
import Button from '../components/Button';
import type { CreatePropertyRequest, CreateLanguageRequest } from '../services/PropertyService';
import './ManagementTab.css';

interface ManagementTabProps {
    onCreateProperty: (request: CreatePropertyRequest) => Promise<void>;
    onCreateLanguage: (request: CreateLanguageRequest) => Promise<void>;
    loading?: boolean;
}

/**
 * Component for managing properties and languages
 */
function ManagementTab({
    onCreateLanguage,
    loading = false
}: ManagementTabProps) {
    // Create Language State
    const [newLanguageCode, setNewLanguageCode] = useState('');
    const [autoFillSelected, setCopyFromLanguage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleCreateLanguage = async () => {
        if (!newLanguageCode.trim()) {
            setErrorMessage('Language code is required');
            return;
        }

        const request: CreateLanguageRequest = {
            language: newLanguageCode.trim(),
            autoFill: autoFillSelected.toLowerCase().includes('yes')
        };

        try {
            await onCreateLanguage(request);
            // Reset form
            setNewLanguageCode('');
            setCopyFromLanguage('');
            setErrorMessage('');
        } catch (error) {
            console.error('Error creating language:', error);
            setErrorMessage('Failed to create language. Please try again.');
        }
    };

    return (
        <div className="management-tab">
            <div className="management-sections">
                {/* Create Language Section */}
                <div className="management-section">
                    <h3 className="section-title">Create New Language</h3>
                    <div className="form-group">
                        <label htmlFor="languageCode" className="form-label">
                            Language Code *
                        </label>
                        <input
                            id="languageCode"
                            type="text"
                            className="form-input"
                            value={newLanguageCode}
                            onChange={(e) => {
                                setNewLanguageCode(e.target.value);
                                if (errorMessage) setErrorMessage('');
                            }}
                            placeholder="e.g., es, pt-BR, zh-CN"
                            disabled={loading}
                            aria-invalid={!!errorMessage}
                            aria-describedby={errorMessage ? 'languageCode-error' : undefined}
                        />
                        {errorMessage && (
                            <div id="languageCode-error" className="form-error" role="alert">
                                {errorMessage}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="copyFromLanguage" className="form-label">
                            Fill with Supertext AI
                        </label>
                        <select
                            id="copyFromLanguage"
                            className="form-select"
                            value={autoFillSelected}
                            onChange={(e) => setCopyFromLanguage(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">No (empty translations)</option>
                            {["Yes (all the properties will be generated)"].map(response => (
                                <option key={response} value={response}>
                                    {response}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleCreateLanguage}
                        loading={loading}
                        disabled={loading || !newLanguageCode.trim()}
                    >
                        Create Language
                    </Button>
                </div>


            </div>
        </div>
    );
}

export default ManagementTab;