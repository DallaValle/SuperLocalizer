using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SuperLocalizer.Model;

namespace SuperLocalizer.Clients;

public interface IAITranslationClient
{
    Task<string> TranslateText(string text, string sourceLanguage, string targetLanguage);
    Task<SupertextLanguageResponse> GetAllAiSupportedLanguages();
}

public class AITranslationClient : IAITranslationClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AITranslationClient> _logger;
    private readonly string _baseUrl;
    private readonly string _apiKey;

    public AITranslationClient(HttpClient httpClient, IConfiguration configuration, ILogger<AITranslationClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _baseUrl = _configuration["Supertext:Url"];
        _apiKey = _configuration["Supertext:ApiKey"] ?? throw new InvalidOperationException("Supertext API key not configured");
    }

    public async Task<string> TranslateText(string text, string sourceLanguage, string targetLanguage)
    {
        var request = new TranslateRequest
        {
            Text = new List<string> { text },
            SourceLang = sourceLanguage,
            TargetLang = targetLanguage
        };

        var requestJson = JsonConvert.SerializeObject(request);
        var requestContent = new StringContent(requestJson, Encoding.UTF8, "application/json");

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/v1/translate/ai/text")
        {
            Content = requestContent
        };
        httpRequest.Headers.Add("Authorization", _apiKey);

        var response = await _httpClient.SendAsync(httpRequest);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("Translation API request failed: {StatusCode} - {Content}",
                response.StatusCode, errorContent);
            throw new HttpRequestException($"Translation API request failed: {response.StatusCode}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        var translateResponse = JsonConvert.DeserializeObject<TranslateResponse>(responseJson);

        return translateResponse?.TranslatedText?.FirstOrDefault() ?? string.Empty;
    }

    public async Task<SupertextLanguageResponse> GetAllAiSupportedLanguages()
    {
        var httpRequest = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}/v1/features");
        httpRequest.Headers.Add("Authorization", _apiKey);

        var response = await _httpClient.SendAsync(httpRequest);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("Language features API request failed: {StatusCode} - {Content}",
                response.StatusCode, errorContent);
            throw new HttpRequestException($"Language features API request failed: {response.StatusCode}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        var languageResponse = JsonConvert.DeserializeObject<SupertextLanguageResponse>(responseJson);

        return languageResponse ?? new SupertextLanguageResponse();
    }
}