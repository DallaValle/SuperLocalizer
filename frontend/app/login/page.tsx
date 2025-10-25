'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export default function LoginPage() {
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
            // Simula una chiamata API di login
            // In una vera applicazione, qui faresti una chiamata al tuo backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            if (response.ok) {
                const data = await response.json()
                login(data.token)
                router.push(redirectPath)
            } else {
                // Per ora simulo un login di test
                if (username === 'admin' && password === 'password') {
                    const mockToken = 'mock-jwt-token-' + Date.now()
                    login(mockToken)
                    router.push(redirectPath)
                } else {
                    setError('Invalid credentials')
                }
            }
        } catch (err) {
            // Fallback per il login di test
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
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="test-credentials">
                    Test credentials: <strong>admin / password</strong>
                </p>
            </div>
        </div>
    )
}