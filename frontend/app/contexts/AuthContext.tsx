'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
    isAuthenticated: boolean
    token: string | null
    login: (token: string) => void
    logout: () => void
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const savedToken = localStorage.getItem('auth-token')
        if (savedToken) {
            setToken(savedToken)
        }
        setLoading(false)
    }, [])

    const login = (newToken: string) => {
        setToken(newToken)
        localStorage.setItem('auth-token', newToken)
        document.cookie = `auth-token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
    }

    const logout = () => {
        setToken(null)
        localStorage.removeItem('auth-token')
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        window.location.href = '/login'
    }

    const value = {
        isAuthenticated: !!token,
        token,
        login,
        logout,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}