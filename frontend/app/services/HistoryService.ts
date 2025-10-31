export interface HistoryItem {
    valueKey: string
    userName: string
    timestamp: string
    previousValue: {
        key?: string
        propertyKey?: string
        language?: string
        text: string
        isVerified: boolean
        isReviewed: boolean
        comments?: any[]
    } | null
    newValue: {
        key?: string
        propertyKey?: string
        language?: string
        text: string
        isVerified: boolean
        isReviewed: boolean
        comments?: any[]
    } | null
}

export interface SearchHistoryRequest {
    valueKey?: string
    userName?: string
    fromDate?: string
    toDate?: string
    page?: number
    size?: number
}

export interface SearchResponse<T> {
    items: T[]
    totalItems: number
    page: number
    size: number
    totalPages: number
}

export class HistoryService {
    private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    static async searchHistory(request: SearchHistoryRequest): Promise<SearchResponse<HistoryItem>> {
        console.log('Making history search request:', request)
        const response = await fetch(`${this.BASE_URL}/history/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        })

        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Error response:', errorText)
            throw new Error(`Failed to search history: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Response data:', data)
        return data
    }

    static async getHistoryByValueId(valueKey: string): Promise<HistoryItem[]> {
        const response = await this.searchHistory({
            valueKey: valueKey,
            page: 1,
            size: 1000 // Large size to get all items for a specific value
        })

        return response.items
    }

    static async getHistoryByDateRange(fromDate: string, toDate: string): Promise<HistoryItem[]> {
        const response = await this.searchHistory({
            fromDate,
            toDate,
            page: 1,
            size: 1000
        })

        return response.items
    }

    static async getHistoryByUser(userName: string): Promise<HistoryItem[]> {
        const response = await this.searchHistory({
            userName,
            page: 1,
            size: 1000
        })

        return response.items
    }

    static async getAllHistory(): Promise<HistoryItem[]> {
        const response = await this.searchHistory({
            page: 1,
            size: 1000
        })

        return response.items
    }
}