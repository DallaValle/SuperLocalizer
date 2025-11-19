import React from 'react';
import { useTranslations } from 'next-intl'
import type { SearchFilters, SortField, SortDirection } from '../../types/domain';
import { LANGUAGES, SORT_FIELDS, SORT_DIRECTIONS } from '../../types/domain';
import Button from '../../components/Button';
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

    const t = useTranslations('properties')

    return (
        <div className="search-filters">
            <div className="search-filters__row">
                <div className="search-filters__group">
                    <label htmlFor="searchTerm" className="search-filters__label">
                        {t('filters.searchLabel')}
                    </label>
                    <input
                        id="searchTerm"
                        type="text"
                        className="search-filters__input"
                        value={filters.searchTerm}
                        onChange={(e) => handleInputChange('searchTerm', e.target.value)}
                        placeholder={t('filters.searchPlaceholder')}
                        disabled={loading}
                    />
                </div>

                <div className="search-filters__group">
                    <label htmlFor="language" className="search-filters__label">
                        {t('filters.languageLabel')}
                    </label>
                    <select
                        id="language"
                        className="search-filters__select"
                        value={filters.selectedLanguage}
                        onChange={(e) => handleInputChange('selectedLanguage', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">{t('filters.allLanguages')}</option>
                        {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-filters__group">
                    <label htmlFor="verified" className="search-filters__label">
                        {t('filters.verifiedLabel')}
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
                        <option value="">{t('filters.all')}</option>
                        <option value="true">{t('filters.verified')}</option>
                        <option value="false">{t('filters.notVerified')}</option>
                    </select>
                </div>

                <div className="search-filters__group">
                    <label htmlFor="reviewed" className="search-filters__label">
                        {t('filters.reviewedLabel')}
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
                        <option value="">{t('filters.all')}</option>
                        <option value="true">{t('filters.reviewed')}</option>
                        <option value="false">{t('filters.notReviewed')}</option>
                    </select>
                </div>
            </div>

            <div className="search-filters__row">
                <div className="search-filters__group">
                    <label htmlFor="orderBy" className="search-filters__label">
                        {t('filters.sortByLabel')}
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
                        {t('filters.sortDirectionLabel')}
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
                                {direction === 'asc' ? t('filters.ascending') : t('filters.descending')}
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
                        {t('filters.searchButton')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onReset}
                        disabled={loading}
                    >
                        {t('filters.resetButton')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default PropertySearchFilters;