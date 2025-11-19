"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../contexts/AuthContext'
import { AccountService } from '../../services/AccoutService'
import Link from 'next/link'
import '../login/Login.css'

export default function SignupPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const t = useTranslations('signup')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError(t('passwordMismatch'))
            return
        }

        setLoading(true)
        try {
            // attempt signup via service
            const searchParams = new URLSearchParams(window.location.search)
            const invitationToken = searchParams.get('invitationToken')
            await AccountService.signUp(username, password, invitationToken || undefined)

            // If signup succeeded, try to sign in automatically
            try {
                await login(username, password)
                router.push('/dashboard')
                return
            } catch (signinErr) {
                // Signin after signup failed; continue to fallback to login page
                console.warn('Signin after signup failed', signinErr)
            }

            // fallback: go to login
            router.push('/login')
        } catch (err: any) {
            // show backend error if available
            const message = err?.message || t('errorGeneric')
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="landing-page">
            <div className="login-box">
                <h2>{t('title')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">{t('usernameLabel')}</label>
                        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">{t('passwordLabel')}</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={loading}>{loading ? t('creating') : t('createButton')}</button>
                </form>
                <p className="signup-link">
                    <Link href="/login" className="signup-button">{t('backToLogin')}</Link>
                </p>
            </div>
        </div>
    )
}
