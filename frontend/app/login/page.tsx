'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { AuthService } from '../services/AuthService'
import Link from 'next/link'
import './Login.css'

function LoginContent() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectPath = searchParams.get('redirect') || '/home'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await AuthService.signIn(username, password)
            if (data && data.token) {
                login(data)
                router.push(redirectPath)
            } else {
                setError('No token returned from server')
            }
        } catch (err: any) {
            // Try to show a helpful message when available
            const message = err?.message || 'An error occurred during login'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="landing-page">
            <header className="properties-header">
                <div className="header-title">
                    <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="header-logo" />
                </div>
                <div className="header-actions">
                    <Link href="/login" className="navbar-item">
                        Login
                    </Link>
                    <Link href="/signup" className="navbar-item navbar-button">
                        Try it for free
                    </Link>
                </div>
            </header>

            <div className="login-box">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter admin"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter password"
                        />
                    </div>
                    {error && <div className="error-message">Login failed</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="test-credentials">
                    Test credentials: <strong>admin / password</strong>
                </p>
                <p className="signup-link">
                    <Link href="/signup" className="signup-button">Create account</Link>
                </p>
            </div>
        </div>
    )
}

function LoginPageFallback() {
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="login-logo" />
                    <h1>SuperLocalizer</h1>
                </div>
                <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageFallback />}>
            <LoginContent />
        </Suspense>
    )
}