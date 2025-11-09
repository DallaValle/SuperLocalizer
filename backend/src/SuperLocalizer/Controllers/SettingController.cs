using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Repository;
using SuperLocalizer.Services;

namespace SuperLocalizer.Controllers;

[Authorize]
[ApiController]
[Route("project/{projectId}/setting")]
public class SettingController : ControllerBase
{
    private readonly ISettingService _settingService;
    private readonly IUserProfile _userProfile;
    private readonly IProjectRepository _projectRepository;

    public SettingController(ISettingService syncService, IUserProfile userProfile, IProjectRepository projectRepository)
    {
        _settingService = syncService;
        _userProfile = userProfile;
        _projectRepository = projectRepository;
    }

    /// <summary>
    /// upload localization files and import them into the database
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(int projectId, IFormFile file, string language)
    {
        if (file == null || file.Length == 0 || string.IsNullOrEmpty(language))
            return BadRequest("No files uploaded or language not specified.");

        var user = await _userProfile.GetCurrentUser();
        if (user?.CompanyId == null)
        {
            return Unauthorized("User not authorized. Or company not found.");
        }

        var project = await _projectRepository.GetByIdAsync(user.CompanyId.Value, projectId);
        if (project == null)
        {
            return NotFound("Project not found.");
        }

        await _settingService.ImportAsync(projectId, file, language);
        project.Languages.Add(language);
        await _projectRepository.UpdateAsync(project);
        return Ok("Import completed successfully.");
    }

    /// <summary>
    /// download localization files from the database
    /// </summary>
    [HttpPost("download")]
    public async Task<IActionResult> DownloadFile(int projectId, string language)
    {
        var files = await _settingService.ExportAsync(projectId, language);
        return File(files, "application/json", $"{language}.json");
    }

    /// <summary>
    /// save snapshot of current project
    /// </summary>
    [HttpPost("snapshot")]
    public async Task<IActionResult> SaveSnapshot(int projectId)
    {
        var user = await _userProfile.GetCurrentUser();
        if (user?.CompanyId == null)
        {
            return Unauthorized("User not authorized. Or company not found.");
        }

        var project = await _projectRepository.GetByIdAsync(user.CompanyId.Value, projectId);
        if (project == null)
        {
            return NotFound("Project not found.");
        }

        await _settingService.SaveSnapshotAsync(projectId, project.Languages);
        return Ok("Snapshot saved successfully.");
    }
}