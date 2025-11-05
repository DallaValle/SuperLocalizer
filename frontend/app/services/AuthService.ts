import { HttpClient } from '../utils/HttpClient';
import type { User, LoginResponse } from '../types/domain';

export class AuthService {
    private static readonly ENDPOINTS = {
        CURRENT_USER: '/auth/user',
        SIGNIN: '/auth/signin',
        SIGNUP: '/auth/signup',
    } as const;

    /**
     * Fetch current authenticated user payload from the backend
     */
    static async getCurrentUser(): Promise<User | null> {
        return await HttpClient.get<User>(this.ENDPOINTS.CURRENT_USER);
    }

    /**
     * Sign in with username/password and return the login payload (token + user)
     */
    static async signIn(username: string, password: string): Promise<LoginResponse> {
        const payload = { username, password };
        // HttpClient.post will throw on non-2xx according to its implementation
        return await HttpClient.post<LoginResponse>(this.ENDPOINTS.SIGNIN, payload);
    }

    /**
     * Sign up a new user. Returns whatever the backend returns (often a success message).
     * On success callers may optionally call signIn to authenticate immediately.
     */
    static async signUp(username: string, password: string): Promise<any> {
        const payload = { username, password };
        return await HttpClient.post<any>(this.ENDPOINTS.SIGNUP, payload);
    }
}
