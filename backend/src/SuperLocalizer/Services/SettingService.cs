using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Services;

public interface ISettingService
{
    Task<List<MergeError>> ImportAsync(IFormFile file, string language);
    Task<byte[]> ExportAsync(string targetLanguage);
}

public class SettingService : ISettingService
{
    private readonly IPropertyReaderService _propertyReader;
    private readonly IFusionCache _fusionCache;
    private readonly FileService _fileService;

    public SettingService(IPropertyReaderService propertyReader, IFusionCache fusionCache, FileService fileService)
    {
        _propertyReader = propertyReader;
        _fusionCache = fusionCache;
        _fileService = fileService;
    }

    public async Task<List<MergeError>> ImportAsync(IFormFile file, string language)
    {
        using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream);
        var content = await reader.ReadToEndAsync();
        var json = JObject.Parse(content);
        var properties = _propertyReader.Load(json, language, false, false);
        var allProperties = _fusionCache.GetOrDefault(CacheKeys.AllProperties, new Dictionary<string, Property>());
        var newProperties = _propertyReader.MergeValues(allProperties, properties);
        _fusionCache.Set(CacheKeys.AllProperties, newProperties);
        return new List<MergeError>();
    }

    public Task<byte[]> ExportAsync(string targetLanguage)
    {
        var allProperties = _fusionCache.GetOrDefault(CacheKeys.AllProperties, new List<Property>());
        var targetLanguageProperties = allProperties.FindAll(p => p.Values.Exists(v => v.Language == targetLanguage));
        var json = _propertyReader.UnLoad(targetLanguageProperties, targetLanguage);
        var fileBytes = _fileService.GenerateFileContent(json);
        return Task.FromResult(fileBytes);
    }
}

public class MergeError
{

}