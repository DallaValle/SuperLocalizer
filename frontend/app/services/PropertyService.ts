import { HttpClient } from '../utils/HttpClient';
import type {
    Property,
    PropertyValue,
    PropertySearchRequest,
    PropertySearchResponse,
    PropertyValueUpdateRequest
} from '../types/domain';

/**
 * Service for managing property-related API operations
 */
export class PropertyService {
    private static readonly ENDPOINTS = {
        SEARCH: '/property/search',
        UPDATE: '/property',
        UPDATE_VALUE: (propertyKey: string, language: string) =>
            `/property/${encodeURIComponent(propertyKey)}/${encodeURIComponent(language)}`
    } as const;

    /**
     * Search properties with filtering and pagination
     */
    static async searchProperties(request: PropertySearchRequest): Promise<PropertySearchResponse> {
        return HttpClient.post<PropertySearchResponse>(this.ENDPOINTS.SEARCH, request);
    }

    /**
     * Update an entire property
     */
    static async updateProperty(property: Property): Promise<Property> {
        return HttpClient.put<Property>(this.ENDPOINTS.UPDATE, property);
    }

    /**
     * Update a specific property value
     */
    static async updatePropertyValue(
        propertyKey: string,
        language: string,
        updateRequest: PropertyValueUpdateRequest
    ): Promise<PropertyValue> {
        const endpoint = this.ENDPOINTS.UPDATE_VALUE(propertyKey, language);
        return HttpClient.patch<PropertyValue>(endpoint, updateRequest);
    }
}