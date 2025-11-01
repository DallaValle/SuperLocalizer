import { useState, useCallback } from 'react';
import { ApiRequestError, NetworkError } from '../types/api';

interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseAsyncResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (...args: unknown[]) => Promise<T | undefined>;
    reset: () => void;
}

/**
 * Custom hook for handling async operations with loading states and error handling
 */
export function useAsync<T>(
    asyncFunction: (...args: unknown[]) => Promise<T>,
    immediate: boolean = false
): UseAsyncResult<T> {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });

    const execute = useCallback(
        async (...args: unknown[]): Promise<T | undefined> => {
            setState({ data: null, loading: true, error: null });

            try {
                const result = await asyncFunction(...args);
                setState({ data: result, loading: false, error: null });
                return result;
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                setState({ data: null, loading: false, error: errorMessage });
                return undefined;
            }
        },
        [asyncFunction]
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        execute,
        reset,
    };
}

/**
 * Extract user-friendly error message from various error types
 */
function getErrorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
        switch (error.status) {
            case 400:
                return 'Invalid request. Please check your input.';
            case 401:
                return 'You are not authorized. Please log in again.';
            case 403:
                return 'You do not have permission to perform this action.';
            case 404:
                return 'The requested resource was not found.';
            case 429:
                return 'Too many requests. Please try again later.';
            case 500:
                return 'Server error. Please try again later.';
            default:
                return error.message || 'An unexpected error occurred.';
        }
    }

    if (error instanceof NetworkError) {
        return 'Network error. Please check your connection and try again.';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred.';
}

/**
 * Hook for managing form submissions with async operations
 */
export function useAsyncSubmit<T>(
    submitFunction: (...args: unknown[]) => Promise<T>
): UseAsyncResult<T> & { submit: (...args: unknown[]) => Promise<T | undefined> } {
    const asyncResult = useAsync(submitFunction);

    return {
        ...asyncResult,
        submit: asyncResult.execute,
    };
}