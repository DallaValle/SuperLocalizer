import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type SearchParamValue = string | number | boolean | null | undefined;

interface UseSearchParamsResult {
    getParam: (key: string) => string | null;
    getNumberParam: (key: string, defaultValue?: number) => number;
    getBooleanParam: (key: string, defaultValue?: boolean) => boolean;
    setParam: (key: string, value: SearchParamValue) => void;
    setParams: (params: Record<string, SearchParamValue>) => void;
    removeParam: (key: string) => void;
    clearParams: () => void;
}

/**
 * Custom hook for managing URL search parameters with type safety
 */
export function useSearchParamsState(): UseSearchParamsResult {
    const router = useRouter();
    const searchParams = useSearchParams();

    const getParam = useCallback(
        (key: string): string | null => {
            return searchParams.get(key);
        },
        [searchParams]
    );

    const getNumberParam = useCallback(
        (key: string, defaultValue: number = 0): number => {
            const value = searchParams.get(key);
            if (value === null) return defaultValue;
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? defaultValue : parsed;
        },
        [searchParams]
    );

    const getBooleanParam = useCallback(
        (key: string, defaultValue: boolean = false): boolean => {
            const value = searchParams.get(key);
            if (value === null) return defaultValue;
            return value === 'true';
        },
        [searchParams]
    );

    const updateSearchParams = useCallback(
        (updater: (params: URLSearchParams) => void) => {
            const params = new URLSearchParams(searchParams.toString());
            updater(params);
            router.push(`?${params.toString()}`);
        },
        [router, searchParams]
    );

    const setParam = useCallback(
        (key: string, value: SearchParamValue) => {
            updateSearchParams((params) => {
                if (value === null || value === undefined || value === '') {
                    params.delete(key);
                } else {
                    params.set(key, String(value));
                }
            });
        },
        [updateSearchParams]
    );

    const setParams = useCallback(
        (newParams: Record<string, SearchParamValue>) => {
            updateSearchParams((params) => {
                Object.entries(newParams).forEach(([key, value]) => {
                    if (value === null || value === undefined || value === '') {
                        params.delete(key);
                    } else {
                        params.set(key, String(value));
                    }
                });
            });
        },
        [updateSearchParams]
    );

    const removeParam = useCallback(
        (key: string) => {
            updateSearchParams((params) => {
                params.delete(key);
            });
        },
        [updateSearchParams]
    );

    const clearParams = useCallback(() => {
        router.push(window.location.pathname);
    }, [router]);

    return {
        getParam,
        getNumberParam,
        getBooleanParam,
        setParam,
        setParams,
        removeParam,
        clearParams,
    };
}