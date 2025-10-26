using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Services;

public interface ISyncService
{
    Task<List<MergeError>> ImportAsync(List<IFormFile> files, string mainLanguage);
    Task<bool> ExportAsync();
}

public class SyncService : ISyncService
{
    private readonly IPropertyReader _propertyReader;
    private readonly IFusionCache _fusionCache;

    public SyncService(IPropertyReader propertyReader, IFusionCache fusionCache)
    {
        _propertyReader = propertyReader;
        _fusionCache = fusionCache;
    }

    public async Task<List<MergeError>> ImportAsync(List<IFormFile> files, string mainLanguage)
    {
        var propertyLists = new List<List<Property>>();
        foreach (var file in files)
        {
            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            var content = await reader.ReadToEndAsync();
            var json = JObject.Parse(content);
            var properties = _propertyReader.Load(json, mainLanguage);
            propertyLists.Add(properties);
        }
        var allProperties = _propertyReader.MergeValues(propertyLists);
        var currentProperties = _fusionCache.GetOrDefault(CacheKeys.AllProperties, allProperties);
        var errors = TryMergeProperties(currentProperties, allProperties);
        if (errors.Count == 0)
        {
            _fusionCache.Set(CacheKeys.AllProperties, currentProperties);
        }
        return errors;
    }

    // Scenario: Import method is called from Azure when PR is completed, merge to develop branch.
    // Dev team only add properties or rename property keys.
    // Can happen that in the meantime some language specialists have updated some translations: property -> value -> text.
    // We keep all property value text from currentProperties and we add the new properties from newProperties.
    // A conflict happens when a property has changed key and a value text has changed for the same language.
    private List<MergeError> TryMergeProperties(List<Property> currentProperties, List<Property> newProperties)
    {
        var errors = new List<MergeError>();
        foreach (var newProp in newProperties)
        {
            var existingProp = currentProperties.Find(p => p.Key == newProp.Key);
            if (existingProp == null)
            {
                currentProperties.Add(newProp);
            }
        }
        return errors;
    }

    public async Task<bool> ExportAsync()
    {
        // Implementation for exporting database content to files
        return await Task.FromResult(true);
    }
}

public class MergeError
{

}