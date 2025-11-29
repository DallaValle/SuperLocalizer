using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SuperLocalizer.Clients;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;

namespace SuperLocalizer.Services;

public interface ILanguageService
{
    Task<Dictionary<string, List<string>>> GetAllAiSupportedLanguages();
    Task<bool> CreateLanguage(Guid companyId, Guid projectId, CreateLanguageRequest request);
}

public class LanguageService : ILanguageService
{
    private readonly IPropertyRepository _propertyRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IAITranslationClient _aiTranslationClient;

    public LanguageService(IPropertyRepository propertyRepository, IProjectRepository projectRepository, IAITranslationClient aiTranslationClient)
    {
        _propertyRepository = propertyRepository;
        _projectRepository = projectRepository;
        _aiTranslationClient = aiTranslationClient;
    }

    public async Task<Dictionary<string, List<string>>> GetAllAiSupportedLanguages()
    {
        var languagesResponse = await _aiTranslationClient.GetAllAiSupportedLanguages();
        var languagesDict = new Dictionary<string, List<string>>();
        foreach (var lang in languagesResponse.SupportedFeatures)
        {
            var key = $"{lang.SourceLang}";
            if (!languagesDict.ContainsKey(key))
            {
                languagesDict[key] = new List<string>() { lang.TargetLang };
            }
            else
            {
                languagesDict[key].Add(lang.TargetLang);
            }
        }

        return languagesDict;
    }

    public async Task<bool> CreateLanguage(Guid companyId, Guid projectId, CreateLanguageRequest request)
    {
        var project = await _projectRepository.Read(companyId, projectId);
        if (project == null)
        {
            throw new Exception("Project not found.");
        }

        var properties = await _propertyRepository.Search(
            projectId,
            new SearchPropertyRequest
            {
                Language = project.Languages[0], // Assuming the first language as the base language
                Size = int.MaxValue,
            });

        foreach (var property in properties.Items)
        {
            var value = new Value
            {
                Language = request.Language,
                Text = request.UseAi ? await _aiTranslationClient.TranslateText(
                    property.Values[0].Text,
                    project.Languages[0],
                    request.Language) : string.Empty,
                InsertDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
            };
            property.Values.Add(value);
            property.UpdateDate = DateTime.UtcNow;
            await _propertyRepository.Update(projectId, property);
        }

        return true;
    }
}