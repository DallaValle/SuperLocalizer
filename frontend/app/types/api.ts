// API Response Types
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface ApiError {
    message: string;
    status: number;
    timestamp?: string;
}

// Custom Error Classes
export class ApiRequestError extends Error {
    public readonly status: number;
    public readonly timestamp: string;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.timestamp = new Date().toISOString();
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Network request failed') {
        super(message);
        this.name = 'NetworkError';
    }
}
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// API Configuration
export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
} as const;

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request Options
export interface RequestOptions {
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: string | FormData;
    timeout?: number;
}