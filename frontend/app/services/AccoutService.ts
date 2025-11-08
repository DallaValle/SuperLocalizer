import { HttpClient } from '../utils/HttpClient';
import type { User } from '../types/domain';

export class AccountService {
    private static readonly ENDPOINTS = {
        CURRENT_USER: '/auth/user',
        SIGNUP: '/auth/signup',
    } as const;

    /**
     * Fetch current authenticated user payload from the backend
     */
    static async getCurrentUser(): Promise<User | null> {
        return await HttpClient.get<User>(this.ENDPOINTS.CURRENT_USER);
    }

    /**
     * Sign up a new user. Returns whatever the backend returns (often a success message).
     * On success callers may optionally call signIn to authenticate immediately.
     */
    static async signUp(username: string, password: string, invitation?: string): Promise<any> {
        const payload = { username, password };
        return await HttpClient.post<any>(invitation ? `${this.ENDPOINTS.SIGNUP}?invitationToken=${invitation}` : this.ENDPOINTS.SIGNUP, payload);
    }
}
