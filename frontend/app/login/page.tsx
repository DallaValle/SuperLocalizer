'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../types/api'
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
            const url = `${API_BASE_URL}/auth/signin`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            if (response.ok) {
                const data = await response.json()
                if (data) {
                    // server returns { username, companyId, token }
                    login(data)
                    router.push(redirectPath)
                } else {
                    setError('No token returned from server')
                }
            } else {
                const errText = await response.text()
                setError(errText || 'Invalid credentials')
            }
        } catch (err) {
            // fallback to dev credentials
            if (username === 'admin' && password === 'password') {
                const mockUser = { username: 'admin@admin.it', companyId: 1, token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHJpbmciLCJqdGkiOiJiYzAxMjdlMS01NzdlLTRmMzUtYjNmNC1lMWM4YmIyZmFhN2QiLCJleHAiOjE3NjIxMDM5MTQsImlzcyI6Ik15SXNzdWVyIiwiYXVkIjoiTXlBdWRpZW5jZSJ9.k8sIzezC4ksuex9K_0I_NRFpDjbu3GjgHR93unZdeKM' };
                login(mockUser)
                router.push(redirectPath)
            } else {
                setError('Login error')
            }
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