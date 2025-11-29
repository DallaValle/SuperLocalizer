'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { User } from '../types/domain';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { data: session, status, update } = useSession();
    const [refreshAttempted, setRefreshAttempted] = React.useState(false);

    const loading = status === 'loading';
    const isAuthenticated = !!session?.user;
    const user = session?.user as User || null;
    const token = (session as any)?.backendToken || null;

    // If we have a session but no backend token, it might be expired
    const hasSessionWithoutToken = !!session?.user && !token;

    React.useEffect(() => {
        if (hasSessionWithoutToken && !loading && !refreshAttempted) {
            setRefreshAttempted(true);

            // Trigger a session update to refresh the backend token
            update().then(() => {
                // Check if refresh was successful after a short delay
                setTimeout(() => {
                    const stillMissingToken = !!session?.user && !(session as any)?.backendToken;
                    if (stillMissingToken) {
                        // Optionally, you could force logout here if needed
                        // signOut({ redirect: false });
                    }
                }, 1000);
            }).catch(() => {
                // Handle refresh error silently
            });
        } else if (token && refreshAttempted) {
            // Reset refresh flag when token is restored
            setRefreshAttempted(false);
        }
    }, [hasSessionWithoutToken, loading, refreshAttempted, token, update, session]);

    const login = async (username: string, password: string): Promise<void> => {
        const result = await signIn('credentials', {
            username,
            password,
            redirect: false,
        });

        if (result?.error) {
            throw new Error(result.error);
        }
    };

    const loginWithGoogle = async (): Promise<void> => {
        await signIn('google', { redirect: false });
    };

    const logout = async (): Promise<void> => {
        await signOut({ redirect: false });
        // Navigate to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    const value: AuthContextType = {
        isAuthenticated,
        token,
        user,
        login,
        loginWithGoogle,
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