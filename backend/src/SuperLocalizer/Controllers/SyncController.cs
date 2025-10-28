using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Services;

namespace SuperLocalizer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SyncController : ControllerBase
{
    private readonly ISyncService _syncService;

    public SyncController(ISyncService syncService)
    {
        _syncService = syncService;
    }

    /// <summary>
    /// Import localization files into the database
    /// </summary>
    [HttpPost("import")]
    public async Task<IActionResult> ImportAsync(
        [FromForm] List<IFormFile> files,
        [FromForm] string mainLanguage)
    {
        if (files == null || files.Count == 0)
            return BadRequest("No files uploaded.");

        await _syncService.ImportAsync(files, mainLanguage);
        return Ok("Import completed successfully.");
    }

    /// <summary>
    /// Generate export files from the database
    /// Based on the specified provider: Azure, GitHub, etc.
    /// </summary>
    [HttpPost("export")]
    public async Task<IActionResult> ExportAsync(string provider)
    {
        var files = await _syncService.ExportAsync();
        return Ok(files);
    }
}