import React from 'react';
import type { SearchFilters, SortField, SortDirection } from '../types/domain';
import { LANGUAGES, SORT_FIELDS, SORT_DIRECTIONS } from '../types/domain';
import Button from '../components/Button';
import './PropertySearchFilters.css';

interface SearchFiltersProps {
    filters: SearchFilters;
    onFiltersChange: (filters: Partial<SearchFilters>) => void;
    onSearch: () => void;
    onReset: () => void;
    loading?: boolean;
}

/**
 * Component for property search filters
 */
function PropertySearchFilters({
    filters,
    onFiltersChange,
    onSearch,
    onReset,
    loading = false
}: SearchFiltersProps) {
    const handleInputChange = (field: keyof SearchFilters, value: string | boolean | null) => {
        onFiltersChange({ [field]: value });
    };

    return (
        <div className="search-filters">
            <div className="search-filters__row">
                <div className="search-filters__group">
                    <label htmlFor="searchTerm" className="search-filters__label">
                        Search Term
                    </label>
                    <input
                        id="searchTerm"
                        type="text"
                        className="search-filters__input"
                        value={filters.searchTerm}
                        onChange={(e) => handleInputChange('searchTerm', e.target.value)}
                        placeholder="Search properties..."
                        disabled={loading}
                    />
                </div>

                <div className="search-filters__group">
                    <label htmlFor="language" className="search-filters__label">
                        Language
                    </label>
                    <select
                        id="language"
                        className="search-filters__select"
                        value={filters.selectedLanguage}
                        onChange={(e) => handleInputChange('selectedLanguage', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Languages</option>
                        {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-filters__group">
                    <label htmlFor="verified" className="search-filters__label">
                        Verified Status
                    </label>
                    <select
                        id="verified"
                        className="search-filters__select"
                        value={filters.verifiedFilter === null ? '' : filters.verifiedFilter.toString()}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleInputChange('verifiedFilter', value === '' ? null : value === 'true');
                        }}
                        disabled={loading}
                    >
                        <option value="">All</option>
                        <option value="true">Verified</option>
                        <option value="false">Not Verified</option>
                    </select>
                </div>

                <div className="search-filters__group">
                    <label htmlFor="reviewed" className="search-filters__label">
                        Review Status
                    </label>
                    <select
                        id="reviewed"
                        className="search-filters__select"
                        value={filters.reviewedFilter === null ? '' : filters.reviewedFilter.toString()}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleInputChange('reviewedFilter', value === '' ? null : value === 'true');
                        }}
                        disabled={loading}
                    >
                        <option value="">All</option>
                        <option value="true">Reviewed</option>
                        <option value="false">Not Reviewed</option>
                    </select>
                </div>
            </div>

            <div className="search-filters__row">
                <div className="search-filters__group">
                    <label htmlFor="orderBy" className="search-filters__label">
                        Sort By
                    </label>
                    <select
                        id="orderBy"
                        className="search-filters__select"
                        value={filters.orderBy}
                        onChange={(e) => handleInputChange('orderBy', e.target.value as SortField)}
                        disabled={loading}
                    >
                        {SORT_FIELDS.map((field) => (
                            <option key={field} value={field}>
                                {field.replace(/([A-Z])/g, ' $1').trim()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-filters__group">
                    <label htmlFor="orderDirection" className="search-filters__label">
                        Sort Direction
                    </label>
                    <select
                        id="orderDirection"
                        className="search-filters__select"
                        value={filters.orderDirection}
                        onChange={(e) => handleInputChange('orderDirection', e.target.value as SortDirection)}
                        disabled={loading}
                    >
                        {SORT_DIRECTIONS.map((direction) => (
                            <option key={direction} value={direction}>
                                {direction === 'asc' ? 'Ascending' : 'Descending'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-filters__actions">
                    <Button
                        variant="primary"
                        onClick={onSearch}
                        loading={loading}
                        disabled={loading}
                    >
                        Search
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onReset}
                        disabled={loading}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default PropertySearchFilters;