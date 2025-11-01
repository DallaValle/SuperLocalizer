import { HttpClient } from '../utils/HttpClient';
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
        SEARCH: '/history/search'
    } as const;

    /**
     * Search history with filtering and pagination
     */
    static async searchHistory(request: HistorySearchRequest): Promise<HistorySearchResponse> {
        return HttpClient.post<HistorySearchResponse>(this.ENDPOINTS.SEARCH, request);
    }

    /**
     * Get all history for a specific value by valueKey
     */
    static async getHistoryByValueId(valueKey: string): Promise<HistoryItem[]> {
        const response = await this.searchHistory({
            page: 1,
            size: 1000 // Large size to get all items for a specific value
        });

        // Filter by valueKey if the API doesn't support it directly
        return response.items.filter(item => item.valueKey === valueKey);
    }

    /**
     * Get all history for a specific value
     */
    static async getHistoryByValueKey(propertyKey: string, language: string): Promise<HistoryItem[]> {
        const response = await this.searchHistory({
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
        const response = await this.searchHistory({
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
        const response = await this.searchHistory({
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
        return this.searchHistory({
            page,
            size
        });
    }
}