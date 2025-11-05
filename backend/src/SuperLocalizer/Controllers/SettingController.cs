using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Services;

namespace SuperLocalizer.Controllers;

[ApiController]
[Route("project/{projectId}/setting")]
public class SettingController : ControllerBase
{
    private readonly ISettingService _settingService;

    public SettingController(ISettingService syncService)
    {
        _settingService = syncService;
    }

    /// <summary>
    /// upload localization files and import them into the database
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(int projectId, IFormFile file, string language)
    {
        if (file == null || file.Length == 0 || string.IsNullOrEmpty(language))
            return BadRequest("No files uploaded or language not specified.");

        await _settingService.ImportAsync(projectId, file, language);
        return Ok("Import completed successfully.");
    }

    /// <summary>
    /// download localization files from the database
    /// </summary>
    [HttpPost("download")]
    public async Task<IActionResult> DownloadFile(int projectId, string targetLanguage)
    {
        var files = await _settingService.ExportAsync(projectId, targetLanguage);
        return File(files, "application/json", $"{targetLanguage}.json");
    }

    /// <summary>
    /// save snapshot of current project
    /// </summary>
    [HttpPost("snapshot")]
    public async Task<IActionResult> SaveSnapshot(int projectId)
    {
        await _settingService.SaveSnapshotAsync(projectId);
        return Ok("Snapshot saved successfully.");
    }
}