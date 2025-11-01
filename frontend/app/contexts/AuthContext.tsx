'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const AUTH_TOKEN_KEY = 'auth-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
            if (savedToken) {
                setToken(savedToken);
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            // localStorage might not be available in some environments
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((newToken: string) => {
        if (!newToken) {
            console.error('Invalid token provided to login');
            return;
        }

        setToken(newToken);

        try {
            localStorage.setItem(AUTH_TOKEN_KEY, newToken);
            document.cookie = `${AUTH_TOKEN_KEY}=${newToken}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
        } catch (error) {
            console.error('Error saving authentication token:', error);
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);

        try {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        } catch (error) {
            console.error('Error removing authentication token:', error);
        }

        // Navigate to login page
        window.location.href = '/login';
    }, []);

    const value: AuthContextType = {
        isAuthenticated: Boolean(token),
        token,
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}