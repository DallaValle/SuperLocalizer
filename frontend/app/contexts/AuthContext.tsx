'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { LoginResponse, User } from '../types/domain';
import { AuthService } from '../services/AuthService';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    login: (payload: LoginResponse) => void;
    logout: () => void;
    loading: boolean;
    refreshCurrentUser: () => Promise<User | null>;
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
    const [user, setUser] = useState<User | null>(null);
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
            // If we have a token but no persisted user, try to fetch the current user
            if (savedToken && !savedUser) {
                // fire-and-forget; refreshCurrentUser will update state when done
                (async () => {
                    try {
                        const fetched = await AuthService.getCurrentUser();
                        if (fetched) {
                            setUser(fetched);
                            try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fetched)); } catch { }
                        }
                    } catch (e) {
                        console.warn('Failed to fetch user on init', e);
                    }
                })();
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            // localStorage might not be available in some environments
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshCurrentUser = useCallback(async (): Promise<User | null> => {
        // If in-memory token isn't set yet (page loaded before init effect),
        // try to read the persisted token from localStorage so callers can
        // refresh the user immediately.
        let effectiveToken = token;
        if (!effectiveToken) {
            try {
                const saved = localStorage.getItem(AUTH_TOKEN_KEY);
                if (saved) {
                    effectiveToken = saved;
                    // keep state in sync
                    setToken(saved);
                }
            } catch (e) {
                // ignore localStorage read errors and continue (will return null below)
                console.warn('Failed to read token from localStorage in refreshCurrentUser', e);
            }
        }

        if (!effectiveToken) {
            return null;
        }

        try {
            const currentUser = await AuthService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser)); } catch { }
            } else {
                // If getCurrentUser returns null, it might mean token is invalid
                console.warn('getCurrentUser returned null, token might be invalid');
            }
            return currentUser;
        } catch (e) {
            console.error('Failed to fetch current user', e);
            // If there's an authentication error, clear the session
            if (e && typeof e === 'object' && 'status' in e && (e.status === 401 || e.status === 403)) {
                console.warn('Authentication error, clearing session');
                // Clear auth state manually to avoid circular dependency
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
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
            return null;
        }
    }, [token]);

    const login = useCallback((payload: LoginResponse) => {
        if (!payload) {
            console.error('Invalid payload provided to login');
            return;
        }
        let tokenToStore = payload.token;
        let userToStore = payload.user;

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
        window.location.href = '/';
    }, []);

    const value: AuthContextType = {
        isAuthenticated: Boolean(token),
        token,
        user,
        login,
        logout,
        loading,
        refreshCurrentUser,
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