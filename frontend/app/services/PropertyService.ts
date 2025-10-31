import { Comment } from './CommentService'

export interface PropertyValue {
    id: string
    propertyId: string
    language: string
    text: string
    isVerified: boolean
    isReviewed: boolean
    comments: Comment[]
}

export interface Property {
    id: string
    key: string
    values: PropertyValue[]
    insertDate: string
    updateDate: string
}

export interface PropertySearchRequest {
    page: number
    size: number
    searchTerm?: string
    language?: string
    isVerified?: boolean
    isReviewed?: boolean
    orderBy?: 'Key' | 'InsertDate' | 'UpdateDate'
    orderDirection?: 'asc' | 'desc'
}

export interface PropertySearchResponse {
    items: Property[]
    page: number
    size: number
    totalItems: number
    totalPages: number
}

export interface PropertyValueUpdateRequest {
    text: string
    isVerified: boolean
    isReviewed: boolean
}

export class PropertyService {
    private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    static async searchProperties(request: PropertySearchRequest): Promise<PropertySearchResponse> {
        try {
            const response = await fetch(`${this.BASE_URL}/property/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(request),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error searching properties:', error)
            throw error
        }
    }

    static async updateProperty(property: Property): Promise<Property> {
        try {
            const response = await fetch(`${this.BASE_URL}/property`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(property),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error updating property:', error)
            throw error
        }
    }

    static async updatePropertyValue(propertyKey: string, language: string, updateRequest: PropertyValueUpdateRequest): Promise<PropertyValue> {
        try {
            const response = await fetch(`${this.BASE_URL}/property/${encodeURIComponent(propertyKey)}/${encodeURIComponent(language)}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(updateRequest),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error updating property value:', error)
            throw error
        }
    }
}