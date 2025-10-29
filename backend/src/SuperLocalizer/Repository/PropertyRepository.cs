using System;
using System.Collections.Generic;
using System.Linq;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public interface IPropertyRepository
{
    SearchResponse<Property> GetProperties(SearchPropertyRequest request);
    Property GetPropertyByKey(string key);
    void UpdateProperty(Property property);
}

public class PropertyRepositoryMemory : IPropertyRepository
{
    private readonly IFusionCache _fusionCache;

    public PropertyRepositoryMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public SearchResponse<Property> GetProperties(SearchPropertyRequest request)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties, _ => ReadFilesFromSnapshot());

        var query = allProperties.AsQueryable();

        // Filter by key and Text value if provided
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(p =>
                p.Key.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase) ||
                p.Values.Any(v => v.Text.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase)));
        }

        // Filter by language if provided
        if (!string.IsNullOrEmpty(request.Language))
        {
            query = query.Where(p => p.Values.Any(v => v.Language.Equals(request.Language, System.StringComparison.OrdinalIgnoreCase)));
        }

        // Filter by text if provided
        if (!string.IsNullOrEmpty(request.Text))
        {
            query = query.Where(p => p.Values.Any(v => v.Text.Contains(request.Text, System.StringComparison.OrdinalIgnoreCase)));
        }

        // Filter by verification status if provided
        if (request.IsVerified.HasValue)
        {
            query = query.Where(p => p.Values.Any(v => v.IsVerified == request.IsVerified.Value));
        }

        // Filter by review status if provided
        if (request.IsReviewed.HasValue)
        {
            query = query.Where(p => p.Values.Any(v => v.IsReviewed == request.IsReviewed.Value));
        }

        // Apply ordering
        switch (request.OrderBy)
        {
            case SearchOrder.Key:
                query = request.OrderDirection == SearchOrderDirection.desc
                    ? query.OrderByDescending(p => p.Key)
                    : query.OrderBy(p => p.Key);
                break;
            case SearchOrder.InsertDate:
                query = request.OrderDirection == SearchOrderDirection.desc
                    ? query.OrderByDescending(p => p.InsertDate)
                    : query.OrderBy(p => p.InsertDate);
                break;
            case SearchOrder.UpdateDate:
                query = request.OrderDirection == SearchOrderDirection.desc
                    ? query.OrderByDescending(p => p.UpdateDate)
                    : query.OrderBy(p => p.UpdateDate);
                break;
            default:
                query = query.OrderBy(p => p.Key); // Default ordering
                break;
        }

        // Get total count before pagination
        var totalItems = query.Count();

        // Apply pagination
        var page = request.Page ?? 1;
        var size = request.Size ?? 10;

        if (page < 1) page = 1;
        if (size < 1) size = 10;
        if (size > 100) size = 100; // Limit max page size

        var skip = (page - 1) * size;
        var items = query.Skip(skip).Take(size).ToList();

        var result = new SearchResponse<Property>
        {
            Items = items,
            Page = page,
            Size = size,
            TotalItems = totalItems,
            TotalPages = (int)System.Math.Ceiling((double)totalItems / size)
        };
        return result;
    }

    public Property GetPropertyByKey(string key)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties, _ => ReadFilesFromSnapshot());
        return allProperties.FirstOrDefault(p => p.Key.Equals(key, System.StringComparison.OrdinalIgnoreCase));
    }

    public void UpdateProperty(Property property)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties, _ => ReadFilesFromSnapshot());
        var existingProperty = allProperties.FirstOrDefault(p => p.Key.Equals(property.Key, System.StringComparison.OrdinalIgnoreCase));
        if (existingProperty != null)
        {
            allProperties.Remove(existingProperty);
            allProperties.Add(property);
        }
        _fusionCache.Set(CacheKeys.AllProperties, allProperties);
    }

    public bool MergeProperties(List<Property> newProperties)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties, _ => ReadFilesFromSnapshot());
        var updated = false;

        foreach (var newProp in newProperties)
        {
            var existingProp = allProperties.FirstOrDefault(p => p.Key.Equals(newProp.Key, System.StringComparison.OrdinalIgnoreCase));
            if (existingProp == null)
            {
                allProperties.Add(newProp);
                updated = true;
            }
            else
            {
                // Merge values
                foreach (var newValue in newProp.Values)
                {
                    var existingValue = existingProp.Values.FirstOrDefault(v => v.Language.Equals(newValue.Language, System.StringComparison.OrdinalIgnoreCase));
                    if (existingValue == null)
                    {
                        existingProp.Values.Add(newValue);
                        updated = true;
                    }
                    else
                    {
                        // Update existing value if different
                        if (existingValue.Text != newValue.Text ||
                            existingValue.IsVerified != newValue.IsVerified ||
                            existingValue.IsReviewed != newValue.IsReviewed)
                        {
                            existingValue.Text = newValue.Text;
                            existingValue.IsVerified = newValue.IsVerified;
                            existingValue.IsReviewed = newValue.IsReviewed;
                            updated = true;
                        }
                    }
                }
                existingProp.UpdateDate = DateTime.UtcNow;
            }
        }

        if (updated)
        {
            _fusionCache.Set(CacheKeys.AllProperties, allProperties);
        }

        return updated;
    }

    private List<Property> ReadFilesFromSnapshot()
    {
        // For simplicity, returning an empty list now.
        return new List<Property>();
    }
}