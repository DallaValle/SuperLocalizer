import { HttpClient } from '../utils/HttpClient';
import { getSession } from 'next-auth/react';
import type {
    HistoryItem,
    HistorySearchRequest,
    HistorySearchResponse
} from '../types/domain';

/**
 * Service for managing history-related API operations
 */
export class HistoryService {
    private static readonly ENDPOINTS = {
        SEARCH: (projectId: number) => `/project/${projectId}/history/search`
    } as const;

    private static async getProjectIdFromSession(): Promise<number | undefined> {
        const session = await getSession();
        const user = session?.user as any;
        return user?.mainProjectId;
    }

    /**
     * Search history with filtering and pagination
     */
    static async searchHistory(request: HistorySearchRequest): Promise<HistorySearchResponse> {
        return HttpClient.post<HistorySearchResponse>(this.ENDPOINTS.SEARCH(request.projectId || 1), request);
    }

    /**
     * Get all history for a specific value by valueKey
     */
    static async getHistoryByValueId(valueKey: string): Promise<HistoryItem[]> {
        const projectId = await this.getProjectIdFromSession();
        if (!projectId) return [];

        const response = await this.searchHistory({
            projectId,
            page: 1,
            size: 10
        });

        // Filter by valueKey if the API doesn't support it directly
        return response.items.filter(item => item.valueKey === valueKey);
    }

    /**
     * Get all history for a specific value
     */
    static async getHistoryByValueKey(propertyKey: string, language: string): Promise<HistoryItem[]> {
        const projectId = await this.getProjectIdFromSession();
        if (!projectId) return [];

        const response = await this.searchHistory({
            projectId,
            propertyKey,
            language,
            page: 1,
            size: 1000 // Large size to get all items for a specific value
        });

        return response.items;
    }

    /**
     * Get history filtered by date range
     */
    static async getHistoryByDateRange(fromDate: string, toDate: string): Promise<HistoryItem[]> {
        const projectId = await this.getProjectIdFromSession();
        if (!projectId) return [];

        const response = await this.searchHistory({
            projectId,
            fromDate,
            toDate,
            page: 1,
            size: 1000
        });

        return response.items;
    }

    /**
     * Get history filtered by author
     */
    static async getHistoryByAuthor(author: string): Promise<HistoryItem[]> {
        const projectId = await this.getProjectIdFromSession();
        if (!projectId) return [];

        const response = await this.searchHistory({
            projectId,
            author,
            page: 1,
            size: 1000
        });

        return response.items;
    }

    /**
     * Get all history (with pagination)
     */
    static async getAllHistory(page: number = 1, size: number = 100): Promise<HistorySearchResponse> {
        const projectId = await this.getProjectIdFromSession();
        // If there's no projectId in session, fall back to project 1
        return this.searchHistory({
            projectId: projectId ?? 1,
            page,
            size
        });
    }
}