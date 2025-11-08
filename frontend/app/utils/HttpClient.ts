import { API_CONFIG, ApiRequestError, NetworkError, type RequestOptions } from '../types/api';
import { getSession } from 'next-auth/react';
import { AuthUtils } from './AuthUtils';

/**
 * Base HTTP client with built-in error handling, retries, and timeouts
 */
export class HttpClient {
    private static readonly DEFAULT_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    } as const;

    /**
     * Gets authorization headers with bearer token from NextAuth session
     */
    private static async getAuthHeaders(): Promise<Record<string, string>> {
        try {
            const session = await getSession();
            const token = (session as any)?.backendToken;
            return token ? { 'Authorization': `Bearer ${token}` } : {};
        } catch (error) {
            console.warn('Failed to get auth token from session:', error);
            return {};
        }
    }

    /**
     * Makes an HTTP request with retry logic and error handling
     */
    static async request<T>(
        endpoint: string,
        options: RequestOptions = { method: 'GET' }
    ): Promise<T> {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        if (process.env.NODE_ENV !== 'production') {
            console.log('[HttpClient] Request URL:', url, 'Options:', options);
        }
        const timeout = options.timeout ?? API_CONFIG.TIMEOUT;
        const authHeaders = await this.getAuthHeaders();

        let lastError: Error;

        for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                const response = await this.fetchWithTimeout(url, {
                    ...options,
                    headers: {
                        ...this.DEFAULT_HEADERS,
                        ...authHeaders,
                        ...options.headers,
                    },
                }, timeout);

                if (!response.ok) {
                    // Handle 401 Unauthorized - token expired or invalid
                    if (response.status === 401) {
                        await this.handleUnauthorized();
                    }

                    throw new ApiRequestError(
                        `HTTP ${response.status}: ${response.statusText}`,
                        response.status
                    );
                }

                // Handle empty responses
                const contentType = response.headers.get('content-type');
                if (!contentType?.includes('application/json')) {
                    return {} as T;
                }

                return await response.json() as T;
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.error('[HttpClient] Error for URL:', url, error);
                }
                lastError = error instanceof Error ? error : new Error('Unknown error');

                // Don't retry for client errors (4xx), especially 401 Unauthorized
                if (error instanceof ApiRequestError && error.status >= 400 && error.status < 500) {
                    throw error;
                }

                // Wait before retry (except on last attempt)
                if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
                    await this.delay(API_CONFIG.RETRY_DELAY * attempt);
                }
            }
        }

        throw lastError!;
    }

    /**
     * GET request
     */
    static async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        const options: RequestOptions = { method: 'GET' };
        if (headers) options.headers = headers;
        return this.request<T>(endpoint, options);
    }

    /**
     * POST request
     */
    static async post<T>(
        endpoint: string,
        data?: unknown,
        headers?: Record<string, string>
    ): Promise<T> {
        const options: RequestOptions = { method: 'POST' };
        if (data) options.body = JSON.stringify(data);
        if (headers) options.headers = headers;
        return this.request<T>(endpoint, options);
    }

    /**
     * PUT request
     */
    static async put<T>(
        endpoint: string,
        data?: unknown,
        headers?: Record<string, string>
    ): Promise<T> {
        const options: RequestOptions = { method: 'PUT' };
        if (data) options.body = JSON.stringify(data);
        if (headers) options.headers = headers;
        return this.request<T>(endpoint, options);
    }

    /**
     * PATCH request
     */
    static async patch<T>(
        endpoint: string,
        data?: unknown,
        headers?: Record<string, string>
    ): Promise<T> {
        const options: RequestOptions = { method: 'PATCH' };
        if (data) options.body = JSON.stringify(data);
        if (headers) options.headers = headers;
        return this.request<T>(endpoint, options);
    }

    /**
     * DELETE request
     */
    static async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        const options: RequestOptions = { method: 'DELETE' };
        if (headers) options.headers = headers;
        return this.request<T>(endpoint, options);
    }

    /**
     * Fetch with timeout support
     */
    private static async fetchWithTimeout(
        url: string,
        options: RequestInit,
        timeout: number
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            return response;
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new NetworkError(`Request timeout after ${timeout}ms`);
            }
            throw new NetworkError('Network request failed');
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Handle 401 Unauthorized responses by clearing session and redirecting
     */
    private static async handleUnauthorized(): Promise<void> {
        await AuthUtils.clearSessionAndRedirect();
    }    /**
     * Utility function to delay execution
     */
    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}