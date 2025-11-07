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

    private endpointAllLanguages(): string {
        return `/project/${encodeURIComponent(this.projectId)}/property/all-languages`;
    }

    /**
     * Get all available languages for the project
     */
    async getAllLanguages(): Promise<string[]> {
        return HttpClient.get<string[]>(this.endpointAllLanguages());
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
}