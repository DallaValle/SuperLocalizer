'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import './Automation.css'
import { User } from '../../types/domain'

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string; // Will be used for image path when you add icons
    status: 'connected' | 'not-connected' | 'configuring';
    category: 'api' | 'ci-cd' | 'vcs' | 'cloud';
}

interface IntegrationStatus {
    [key: string]: {
        isLoading: boolean;
        error: string | null;
        message: string | null;
    }
}

export default function AutomationPage() {
    const { data: session } = useSession()
    const user = session?.user as User || null

    const [integrations] = useState<Integration[]>([
        {
            id: 'api',
            name: 'REST API',
            description: 'Integrate localization management directly into your applications with our RESTful API',
            icon: 'api', // You'll add the actual icon path here
            status: 'not-connected',
            category: 'api'
        },
        {
            id: 'cli',
            name: 'Command Line Interface',
            description: 'Manage translations from your terminal with our powerful CLI tool',
            icon: 'cli',
            status: 'not-connected',
            category: 'api'
        },
        {
            id: 'azure',
            name: 'Azure DevOps',
            description: 'Automate translation workflows in your Azure DevOps pipelines',
            icon: 'azure',
            status: 'not-connected',
            category: 'ci-cd'
        },
        {
            id: 'github',
            name: 'GitHub Actions',
            description: 'Synchronize translations with GitHub repositories and automate deployment',
            icon: 'github',
            status: 'not-connected',
            category: 'ci-cd'
        },
        {
            id: 'jenkins',
            name: 'Jenkins',
            description: 'Integrate localization processes into your Jenkins CI/CD pipeline',
            icon: 'jenkins',
            status: 'not-connected',
            category: 'ci-cd'
        }
    ])

    const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({})

    useEffect(() => {
        // Initialize status for all integrations
        const initialStatus: IntegrationStatus = {}
        integrations.forEach(integration => {
            initialStatus[integration.id] = {
                isLoading: false,
                error: null,
                message: null
            }
        })
        setIntegrationStatus(initialStatus)
    }, [integrations])

    const handleConnect = async (integrationId: string) => {
        setIntegrationStatus(prev => ({
            ...prev,
            [integrationId]: {
                isLoading: true,
                error: null,
                message: 'Connecting...'
            }
        }))

        // Simulate connection process
        setTimeout(() => {
            setIntegrationStatus(prev => ({
                ...prev,
                [integrationId]: {
                    isLoading: false,
                    error: null,
                    message: `${integrations.find(i => i.id === integrationId)?.name} connection initiated. Configuration required.`
                }
            }))
        }, 2000)
    }

    const handleConfigure = (integrationId: string) => {
        setIntegrationStatus(prev => ({
            ...prev,
            [integrationId]: {
                isLoading: false,
                error: null,
                message: `Opening ${integrations.find(i => i.id === integrationId)?.name} configuration...`
            }
        }))
    }

    const handleDisconnect = (integrationId: string) => {
        setIntegrationStatus(prev => ({
            ...prev,
            [integrationId]: {
                isLoading: false,
                error: null,
                message: `${integrations.find(i => i.id === integrationId)?.name} has been disconnected.`
            }
        }))
    }

    const getIntegrationsByCategory = (category: string) => {
        return integrations.filter(integration => integration.category === category)
    }

    const renderIntegrationCard = (integration: Integration) => {
        const status = integrationStatus[integration.id]

        return (
            <div key={integration.id} className="integration-card">
                <div className="integration-header">
                    <div className="integration-icon">
                        {/* Placeholder for icon - you'll replace this with actual icons */}
                        <div className="icon-placeholder">
                            {integration.name.charAt(0)}
                        </div>
                    </div>
                    <div className="integration-info">
                        <h3>{integration.name}</h3>
                        <p>{integration.description}</p>
                    </div>
                    <div className={`integration-status ${integration.status}`}>
                        {integration.status === 'connected' && '✅'}
                        {integration.status === 'not-connected' && '⚪'}
                        {integration.status === 'configuring' && '⚙️'}
                    </div>
                </div>

                <div className="integration-content">
                    <div className="integration-actions">
                        {integration.status === 'not-connected' && (
                            <button
                                onClick={() => handleConnect(integration.id)}
                                disabled={status?.isLoading}
                                className="action-btn connect-btn"
                            >
                                {status?.isLoading ? 'Connecting...' : 'Connect'}
                            </button>
                        )}

                        {integration.status === 'connected' && (
                            <>
                                <button
                                    onClick={() => handleConfigure(integration.id)}
                                    className="action-btn configure-btn"
                                >
                                    Configure
                                </button>
                                <button
                                    onClick={() => handleDisconnect(integration.id)}
                                    className="action-btn disconnect-btn"
                                >
                                    Disconnect
                                </button>
                            </>
                        )}

                        {integration.status === 'configuring' && (
                            <button
                                onClick={() => handleConfigure(integration.id)}
                                className="action-btn configure-btn"
                            >
                                Continue Setup
                            </button>
                        )}
                    </div>

                    {status?.message && (
                        <div className="status-message success">
                            {status.message}
                        </div>
                    )}

                    {status?.error && (
                        <div className="status-message error">
                            {status.error}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="automation-page">
            <main className="automation-main">
                <div className="page-title">
                    <h1>Automation & Integrations</h1>
                    <p>Connect SuperLocalizer with your development tools and workflows</p>
                </div>

                <div className="integrations-container">
                    {/* API & CLI Section */}
                    <div className="category-section">
                        <div className="category-header">
                            <h2>🔌 API & Command Line</h2>
                            <p>Direct integration tools for developers</p>
                        </div>
                        <div className="integrations-grid">
                            {getIntegrationsByCategory('api').map(renderIntegrationCard)}
                        </div>
                    </div>

                    {/* CI/CD Section */}
                    <div className="category-section">
                        <div className="category-header">
                            <h2>🚀 CI/CD Pipelines</h2>
                            <p>Automate localization in your deployment workflows</p>
                        </div>
                        <div className="integrations-grid">
                            {getIntegrationsByCategory('ci-cd').map(renderIntegrationCard)}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}