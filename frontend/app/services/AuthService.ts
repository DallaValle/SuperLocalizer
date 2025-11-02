import { HttpClient } from '../utils/HttpClient';
import type { UserPayload } from '../types/domain';

export class AuthService {
    private static readonly ENDPOINTS = {
        CURRENT_USER: '/auth/user'
    } as const;

    /**
     * Fetch current authenticated user payload from the backend
     */
    static async getCurrentUser(): Promise<UserPayload | null> {
        try {
            return await HttpClient.get<UserPayload>(this.ENDPOINTS.CURRENT_USER);
        } catch (error) {
            // If 401 or not found, return null
            console.warn('Unable to fetch current user:', error);
            return null;
        }
    }
}
