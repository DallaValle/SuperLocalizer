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
                // backend returns Token or token
                const token = data.token ?? data.Token ?? data.TokenString ?? data.tokenString
                if (token) {
                    login(token)
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
                const mockToken = 'mock-jwt-token-' + Date.now()
                login(mockToken)
                router.push(redirectPath)
            } else {
                setError('Login error')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>SuperLocalizer</h2>
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