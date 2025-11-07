using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Services;

public interface ISettingService
{
    Task<List<MergeError>> ImportAsync(int projectId, IFormFile file, string language);
    Task<byte[]> ExportAsync(int projectId, string targetLanguage);
    Task SaveSnapshotAsync(int projectId);
}

public class SettingService : ISettingService
{
    private readonly IPropertyReaderService _propertyReader;
    private readonly IFusionCache _fusionCache;
    private readonly FileService _fileService;
    private readonly string _connectionString;

    public SettingService(IPropertyReaderService propertyReader, IFusionCache fusionCache, FileService fileService, IConfiguration configuration)
    {
        _propertyReader = propertyReader;
        _fusionCache = fusionCache;
        _fileService = fileService;
        _connectionString = configuration.GetConnectionString("DefaultConnection");
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

    public Task SaveSnapshotAsync(int projectId)
    {
        var allProperties = _fusionCache.GetOrDefault(CacheKeys.AllProperties(projectId), new Dictionary<string, Property>());
        var json = _propertyReader.UnLoad(allProperties.Values.ToList(), "all");
        // save snapshot inside my sql for now
        using var connection = new MySql.Data.MySqlClient.MySqlConnection(_connectionString);
        connection.Open();
        var command = connection.CreateCommand();
        command.CommandText = @"
            INSERT INTO ProjectSnapshot (ProjectId, SnapshotData, InsertDate)
            VALUES (@ProjectId, @SnapshotData, @InsertDate)";
        command.Parameters.AddWithValue("@ProjectId", projectId);
        command.Parameters.AddWithValue("@SnapshotData", json.ToString());
        command.Parameters.AddWithValue("@InsertDate", System.DateTime.UtcNow);
        command.ExecuteNonQuery();
        return Task.CompletedTask;
    }
}

public class MergeError
{

}