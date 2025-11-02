'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserPayload } from '../types/domain';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    user: UserPayload | null;
    login: (payload: string | UserPayload) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const AUTH_TOKEN_KEY = 'auth-token';
const AUTH_USER_KEY = 'auth-user';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserPayload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
            const savedUser = localStorage.getItem(AUTH_USER_KEY);
            if (savedToken) {
                setToken(savedToken);
            }
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    console.warn('Failed to parse saved user from localStorage', e);
                }
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            // localStorage might not be available in some environments
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((payload: string | UserPayload) => {
        if (!payload) {
            console.error('Invalid payload provided to login');
            return;
        }

        let tokenToStore: string | null = null;
        let userToStore: UserPayload | null = null;

        if (typeof payload === 'string') {
            tokenToStore = payload;
            userToStore = null;
        } else {
            tokenToStore = payload.token;
            userToStore = payload;
        }

        setToken(tokenToStore);
        setUser(userToStore);

        try {
            if (tokenToStore) {
                localStorage.setItem(AUTH_TOKEN_KEY, tokenToStore);
                document.cookie = `${AUTH_TOKEN_KEY}=${tokenToStore}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
            }
            if (userToStore) {
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userToStore));
            } else {
                localStorage.removeItem(AUTH_USER_KEY);
            }
        } catch (error) {
            console.error('Error saving authentication token/user:', error);
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);

        try {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
            document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        } catch (error) {
            console.error('Error removing authentication token/user:', error);
        }

        // Navigate to login page
        window.location.href = '/login';
    }, []);

    const value: AuthContextType = {
        isAuthenticated: Boolean(token),
        token,
        user,
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