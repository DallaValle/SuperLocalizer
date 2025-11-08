'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import './Login.css'

function LoginContent() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, loginWithGoogle } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectPath = searchParams.get('redirect') || '/home'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(username, password)
            router.push(redirectPath)
        } catch (err: any) {
            // Try to show a helpful message when available
            const message = err?.message || 'An error occurred during login'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            setError('')
            setLoading(true)
            await loginWithGoogle()
            router.push(redirectPath)
        } catch (err: any) {
            const message = err?.message || 'An error occurred during Google login'
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
                        />
                    </div>
                    {error && <div className="error-message">Login failed</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="login-divider">
                    <span>or</span>
                </div>

                <button
                    type="button"
                    className="google-login-button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {loading ? 'Signing in...' : 'Continue with Google'}
                </button>
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