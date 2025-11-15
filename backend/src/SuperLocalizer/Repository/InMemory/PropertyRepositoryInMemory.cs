using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public class PropertyRepositoryInMemory : IPropertyRepository
{
    private readonly IFusionCache _fusionCache;

    public PropertyRepositoryInMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public Task<SearchResponse<Property>> Search(Guid projectId, SearchPropertyRequest request)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties(projectId), _ => GetFromDb());

        var query = allProperties.Values.AsQueryable();

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
        return Task.FromResult(result);
    }

    public Task<Property> Read(Guid projectId, string key)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties(projectId), _ => GetFromDb());
        allProperties.TryGetValue(key, out var property);
        return Task.FromResult(property);
    }

    public Task Update(Guid projectId, Property property)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties(projectId), _ => GetFromDb());

        // Update the property in the dictionary
        property.UpdateDate = DateTime.UtcNow;
        allProperties[property.Key] = property;

        _fusionCache.Set(CacheKeys.AllProperties(projectId), allProperties);
        return Task.CompletedTask;
    }

    public Task<bool> MergeProperties(Guid projectId, List<Property> newProperties)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties(projectId), _ => GetFromDb());
        var updated = false;

        foreach (var newProp in newProperties)
        {
            if (!allProperties.TryGetValue(newProp.Key, out var existingProp))
            {
                // Add new property
                allProperties[newProp.Key] = newProp;
                updated = true;
            }
            else
            {
                // Merge values
                foreach (var newValue in newProp.Values)
                {
                    var existingValue = existingProp.Values.FirstOrDefault(v =>
                        v.Language.Equals(newValue.Language, System.StringComparison.OrdinalIgnoreCase));

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

                if (updated)
                {
                    existingProp.UpdateDate = DateTime.UtcNow;
                }
            }
        }

        if (updated)
        {
            _fusionCache.Set(CacheKeys.AllProperties(projectId), allProperties);
        }

        return Task.FromResult(updated);
    }

    private static Dictionary<string, Property> GetFromDb() => new();

    public Task Create(Guid projectId, Property newProperty)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties(projectId), _ => GetFromDb());
        if (allProperties.ContainsKey(newProperty.Key))
        {
            throw new ArgumentException($"Property with key '{newProperty.Key}' already exists.");
        }

        newProperty.InsertDate = DateTime.UtcNow;
        allProperties[newProperty.Key] = newProperty;
        _fusionCache.Set(CacheKeys.AllProperties(projectId), allProperties);
        return Task.CompletedTask;
    }

    public Task<bool> Delete(Guid projectId, string key)
    {
        var allProperties = _fusionCache.GetOrSet(CacheKeys.AllProperties(projectId), _ => GetFromDb());
        var removed = allProperties.Remove(key);
        if (removed)
        {
            _fusionCache.Set(CacheKeys.AllProperties(projectId), allProperties);
        }
        return Task.FromResult(removed);
    }
}