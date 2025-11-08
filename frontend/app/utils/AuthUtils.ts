import { signOut } from 'next-auth/react';

/**
 * Utility functions for handling authentication-related operations
 */
export class AuthUtils {
    /**
     * Clears the user session and redirects to the root path
     * This function can be called from anywhere in the application
     * when authentication errors occur
     */
    static async clearSessionAndRedirect(): Promise<void> {
        try {
            // Sign out the user (clears NextAuth session)
            await signOut({ redirect: false });

            console.log('Session cleared due to authentication error');

            // Redirect to root path
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error during session cleanup:', error);

            // Fallback: redirect to root even if signOut fails
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }
    }

    /**
     * Checks if an error is an authentication error (401 or token-related)
     */
    static isAuthError(error: any): boolean {
        // Check for 401 status code
        if (error?.status === 401) {
            return true;
        }

        // Check for common authentication error messages
        const authErrorMessages = [
            'unauthorized',
            'token expired',
            'invalid token',
            'authentication failed',
            'access denied'
        ];

        const errorMessage = (error?.message || '').toLowerCase();
        return authErrorMessages.some(msg => errorMessage.includes(msg));
    }

    /**
     * Generic error handler that automatically handles auth errors
     * Usage: AuthUtils.handleError(error, () => { // custom error handling })
     */
    static async handleError(error: any, customHandler?: (error: any) => void): Promise<void> {
        if (this.isAuthError(error)) {
            await this.clearSessionAndRedirect();
            return;
        }

        if (customHandler) {
            customHandler(error);
        } else {
            console.error('Unhandled error:', error);
        }
    }
}