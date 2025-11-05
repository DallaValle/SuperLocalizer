"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { AuthService } from '../services/AuthService'
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
            // attempt signup via service
            await AuthService.signUp(username, password)

            // If signup succeeded, try to sign in automatically
            try {
                const data = await AuthService.signIn(username, password)
                if (data && data.token) {
                    login(data)
                    router.push('/home')
                    return
                }
            } catch (signinErr) {
                // Signin after signup failed; continue to fallback to login page
                console.warn('Signin after signup failed', signinErr)
            }

            // fallback: go to login
            router.push('/login')
        } catch (err: any) {
            // show backend error if available
            const message = err?.message || 'Signup failed'
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
