// Base Types
export interface BaseEntity {
    id: string;
    insertDate: string;
    updateDate: string;
}

// Comment Types
export interface Comment extends BaseEntity {
    valueKey: string;
    author: string;
    text: string;
}

export interface CreateCommentRequest {
    valueKey: string;
    author: string;
    text: string;
}

export interface UpdateCommentRequest {
    id: string;
    valueKey: string;
    author: string;
    text: string;
}

// Property Types
export interface PropertyValue extends BaseEntity {
    propertyId: string;
    language: string;
    text: string;
    isVerified: boolean;
    isReviewed: boolean;
    comments: Comment[];
}

export interface Property extends BaseEntity {
    key: string;
    values: PropertyValue[];
}

export interface PropertyValueUpdateRequest {
    text: string;
    isVerified: boolean;
    isReviewed: boolean;
}

// Search and Pagination Types
export type SortField = 'Key' | 'InsertDate' | 'UpdateDate';
export type SortDirection = 'asc' | 'desc';

export interface PropertySearchRequest {
    page: number;
    size: number;
    searchTerm?: string;
    language?: string;
    isVerified?: boolean;
    isReviewed?: boolean;
    orderBy?: SortField;
    orderDirection?: SortDirection;
}

export interface PropertySearchResponse {
    items: Property[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

// History Types
export interface HistoryValue {
    key?: string;
    propertyKey?: string;
    language?: string;
    text: string;
    isVerified: boolean;
    isReviewed: boolean;
    comments?: unknown[];
}

export interface HistoryItem {
    valueKey: string;
    userName: string;
    timestamp: string;
    previousValue: HistoryValue | null;
    newValue: HistoryValue | null;
}

export interface HistorySearchRequest {
    page: number;
    size: number;
    propertyKey?: string;
    language?: string;
    author?: string;
    fromDate?: string;
    toDate?: string;
}

export interface HistorySearchResponse {
    items: HistoryItem[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

// UI State Types
export interface ModalState {
    isOpen: boolean;
    propertyKey: string;
    language: string;
    valueKey: string;
}

export interface EditingState {
    [key: string]: PropertyValue;
}

export interface SavingState {
    [key: string]: boolean;
}

export interface ActiveFieldsState {
    [key: string]: boolean;
}

// Form Types
export interface SearchFilters {
    searchTerm: string;
    selectedLanguage: string;
    verifiedFilter: boolean | null;
    reviewedFilter: boolean | null;
    orderBy: SortField;
    orderDirection: SortDirection;
}

export interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

// Constants
export const LANGUAGES = ['en', 'de-CH', 'de-DE', 'fr', 'it'] as const;
export type Language = typeof LANGUAGES[number];

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export type PageSize = typeof PAGE_SIZES[number];

export const SORT_FIELDS: SortField[] = ['Key', 'InsertDate', 'UpdateDate'];
export const SORT_DIRECTIONS: SortDirection[] = ['asc', 'desc'];

// Company
export interface Company {
    id: number;
    name: string;
    address?: string;
    email?: string;
    phone?: string;
    insertDate?: string;
    updateDate?: string;
}

// Project
export interface Project {
    id: number;
    name: string;
    description?: string;
    insertDate?: string;
    updateDate?: string;
    companyId: number;
}

export interface User {
    id: number;
    username: string;
    companyId?: number;
    companyName?: string;
    mainProjectId?: number;
    mainProjectName?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}