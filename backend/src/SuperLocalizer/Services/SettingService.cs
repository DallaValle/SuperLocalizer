using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Services;

public interface ISettingService
{
    Task<List<MergeError>> ImportAsync(int projectId, IFormFile file, string language);
    Task<byte[]> ExportAsync(int projectId, string targetLanguage);
    Task SaveSnapshotAsync(int projectId, List<string> languages);
    Task<List<SnapshotItem>> GetSnapshotsAsync(int projectId, int limit);
    Task RollbackToSnapshotAsync(int snapshotId);
}

public class SettingService : ISettingService
{
    private readonly IPropertyReaderService _propertyReader;
    private readonly IFusionCache _fusionCache;
    private readonly FileService _fileService;
    private readonly ISnapshotRepository _snapshotRepository;

    public SettingService(
        IPropertyReaderService propertyReader,
        IFusionCache fusionCache,
        FileService fileService,
        ISnapshotRepository snapshotRepository)
    {
        _propertyReader = propertyReader;
        _fusionCache = fusionCache;
        _fileService = fileService;
        _snapshotRepository = snapshotRepository;
    }

    public async Task<List<MergeError>> ImportAsync(int projectId, IFormFile file, string language)
    {
        using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream);
        var content = await reader.ReadToEndAsync();
        var json = JObject.Parse(content);
        var properties = _propertyReader.Load(json, language, false, false);
        var allProperties = _fusionCache.GetOrDefault(CacheKeys.AllProperties(projectId), new Dictionary<string, Property>());
        var newProperties = _propertyReader.MergeValues(allProperties, properties);
        _fusionCache.Set(CacheKeys.AllProperties(projectId), newProperties);
        return new List<MergeError>();
    }

    public Task<byte[]> ExportAsync(int projectId, string targetLanguage)
    {
        var allProperties = _fusionCache.GetOrDefault(CacheKeys.AllProperties(projectId), new Dictionary<string, Property>());
        var targetLanguageProperties = allProperties.Values.ToList().FindAll(p => p.Values.Exists(v => v.Language == targetLanguage));
        var json = _propertyReader.UnLoad(targetLanguageProperties, targetLanguage);
        var fileBytes = _fileService.GenerateFileContent(json);
        return Task.FromResult(fileBytes);
    }

    public async Task SaveSnapshotAsync(int projectId, List<string> languages)
    {
        var allProperties = _fusionCache.GetOrDefault(CacheKeys.AllProperties(projectId), new Dictionary<string, Property>());
        var snapshot = new Dictionary<string, JObject>();
        foreach (var lang in languages)
        {
            var langProperties = allProperties.Values.ToList().FindAll(p => p.Values.Exists(v => v.Language == lang));
            var langJson = _propertyReader.UnLoad(langProperties, lang);
            snapshot[lang] = langJson;
        }
        // save snapshot inside my sql for now
        await _snapshotRepository.SaveSnapshotAsync(projectId, JsonConvert.SerializeObject(snapshot));
    }

    public Task<List<SnapshotItem>> GetSnapshotsAsync(int projectId, int limit)
    {
        return _snapshotRepository.GetSnapshotsByProjectIdAsync(projectId, limit);
    }

    public async Task RollbackToSnapshotAsync(int snapshotId)
    {
        var snapshot = await _snapshotRepository.RollbackToSnapshotAsync(snapshotId);
        var snapshotData = JsonConvert.DeserializeObject<Dictionary<string, JObject>>(snapshot.SnapshotData);
        if (snapshotData == null) return;

        var allProperties = new Dictionary<string, Property>();
        foreach (var (lang, json) in snapshotData)
        {
            var properties = _propertyReader.Load(json, lang, false, false);
            foreach (var prop in properties)
            {
                allProperties[prop.Key] = prop;
            }
        }
        _fusionCache.Set(CacheKeys.AllProperties(snapshot.ProjectId), allProperties);
    }
}

public class MergeError
{

}