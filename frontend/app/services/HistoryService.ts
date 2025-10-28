export interface HistoryItem {
    valueId: string
    previousText: string
    newText: string
    timestamp: string
    userName: string
}

export class HistoryService {
    private static readonly BASE_URL = 'http://localhost:5000/api'

    static async getHistoryByValueId(valueId: string): Promise<HistoryItem[]> {
        const response = await fetch(`${this.BASE_URL}/history/property/value/${valueId}`)

        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.statusText}`)
        }

        return await response.json()
    }

    static async getHistoryByDateRange(fromDate: string, toDate: string): Promise<HistoryItem[]> {
        const response = await fetch(`${this.BASE_URL}/history/date/${fromDate}/${toDate}`)

        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.statusText}`)
        }

        return await response.json()
    }

    static async getHistoryByUser(userName: string): Promise<HistoryItem[]> {
        const response = await fetch(`${this.BASE_URL}/history/user/${userName}`)

        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.statusText}`)
        }

        return await response.json()
    }

    static async getAllHistory(): Promise<HistoryItem[]> {
        const response = await fetch(`${this.BASE_URL}/history`)

        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.statusText}`)
        }

        return await response.json()
    }
}