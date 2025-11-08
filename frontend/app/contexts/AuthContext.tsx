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
    const { data: session, status } = useSession();

    const loading = status === 'loading';
    const isAuthenticated = !!session?.user;
    const user = session?.user as User || null;
    const token = (session as any)?.backendToken || null;

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