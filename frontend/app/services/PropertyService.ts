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
    private readonly projectId: number;

    constructor(projectId: number) {
        this.projectId = projectId;
    }

    private endpointSearch(): string {
        return `/project/${encodeURIComponent(this.projectId)}/property/search`;
    }

    private endpointUpdate(): string {
        return `/project/${encodeURIComponent(this.projectId)}/property`;
    }

    private endpointUpdateValue(propertyKey: string, language: string): string {
        return `/project/${encodeURIComponent(this.projectId)}/property/${encodeURIComponent(propertyKey)}/${encodeURIComponent(language)}`;
    }

    /**
     * Search properties with filtering and pagination
     */
    async searchProperties(request: PropertySearchRequest): Promise<PropertySearchResponse> {
        return HttpClient.post<PropertySearchResponse>(this.endpointSearch(), request);
    }

    /**
     * Update an entire property
     */
    async updateProperty(property: Property): Promise<Property> {
        return HttpClient.put<Property>(this.endpointUpdate(), property);
    }

    /**
     * Update a specific property value
     */
    async updatePropertyValue(
        propertyKey: string,
        language: string,
        updateRequest: PropertyValueUpdateRequest
    ): Promise<PropertyValue> {
        const endpoint = this.endpointUpdateValue(propertyKey, language);
        return HttpClient.patch<PropertyValue>(endpoint, updateRequest);
    }

    /**
     * Create a new property with values for specified languages
     */
    async createProperty(request: CreatePropertyRequest): Promise<Property> {
        const endpoint = `/project/${encodeURIComponent(this.projectId)}/property`;
        return HttpClient.put<Property>(endpoint, request);
    }

    /**
     * Bulk update flags for properties matching current search criteria
     */
    async bulkUpdateFlags(
        searchRequest: PropertySearchRequest,
        isVerified: boolean | null,
        isReviewed: boolean | null
    ): Promise<void> {
        const endpoint = `/project/${encodeURIComponent(this.projectId)}/property/bulk-update`;
        const request = {
            query: searchRequest,
            isVerified,
            isReviewed
        };
        return HttpClient.post<void>(endpoint, request);
    }
}

// Types for the management functionality
export interface CreatePropertyRequest {
    key: string;
    values: Array<{
        propertyKey: string;
        language: string;
        text: string;
        isVerified: boolean;
        isReviewed: boolean;
        insertDate: string;
        updateDate: string;
        comments: any[];
    }>;
}

export interface CreateLanguageRequest {
    language: string;
    autoFill: boolean;
}