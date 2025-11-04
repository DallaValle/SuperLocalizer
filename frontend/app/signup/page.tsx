"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../types/api'
import Link from 'next/link'
import '../login/Login.css'

export default function SignupPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            const url = `${API_BASE_URL}/auth/signup`
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            if (response.ok) {
                // automatically sign in after signup if token returned, otherwise redirect to login
                // backend returns a success message; try to sign in
                const signinResp = await fetch(`${API_BASE_URL}/auth/signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                })

                if (signinResp.ok) {
                    const data = await signinResp.json()
                    // backend may return full user object { username, companyId, token }
                    if (data && (data.token || data.Token)) {
                        // prefer passing the whole object if provided
                        login(data)
                        router.push('/home')
                        return
                    }
                }

                // fallback: go to login
                router.push('/login')
            } else {
                const err = await response.text()
                setError(err || 'Signup failed')
            }
        } catch (err) {
            setError('Signup error')
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
                <h2>Create account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username / Email:</label>
                        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm password:</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
                </form>
                <p className="signup-link">
                    <Link href="/login" className="signup-button">Back to login</Link>
                </p>
            </div>
        </div>
    )
}
