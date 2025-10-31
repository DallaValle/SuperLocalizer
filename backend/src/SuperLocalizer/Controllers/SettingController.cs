using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Services;

namespace SuperLocalizer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingController : ControllerBase
{
    private readonly ISettingService _syncService;

    public SettingController(ISettingService syncService)
    {
        _syncService = syncService;
    }

    /// <summary>
    /// upload localization files and import them into the database
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> ImportAsync(IFormFile file, string language)
    {
        if (file == null || file.Length == 0 || string.IsNullOrEmpty(language))
            return BadRequest("No files uploaded or language not specified.");

        await _syncService.ImportAsync(file, language);
        return Ok("Import completed successfully.");
    }

    /// <summary>
    /// download localization files from the database
    /// </summary>
    [HttpPost("download")]
    public async Task<IActionResult> ExportAsync(string targetLanguage)
    {
        var files = await _syncService.ExportAsync(targetLanguage);
        return File(files, "application/json", $"{targetLanguage}.json");
    }
}