using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;
using SuperLocalizer.Services;

namespace SuperLocalizer.Controllers;

[Authorize]
[ApiController]
[Route("company/{companyId}/project")]
public class ProjectController : ControllerBase
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserProfile _userProfile;

    public ProjectController(IProjectRepository companyRepository, IUserRepository userRepository, IUserProfile userProfile)
    {
        _projectRepository = companyRepository;
        _userRepository = userRepository;
        _userProfile = userProfile;
    }

    /// <summary>
    /// Get all supported languages for a project id
    /// </summary>
    [HttpGet("{id}/all-languages")]
    public async Task<IActionResult> GetAllSupportedLanguages(Guid companyId, Guid id)
    {
        var project = await _projectRepository.Read(companyId, id);
        if (project == null) return NotFound("Project not found.");
        return Ok(project.Languages);
    }

    /// <summary>
    /// Create a new language for a project
    /// </summary>
    [HttpPost("{id}/language")]
    public async Task<IActionResult> CreateLanguage(Guid companyId, Guid id, [FromBody] CreateLanguageRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Language))
            return BadRequest("Invalid request.");

        var project = await _projectRepository.Read(companyId, id);
        if (project == null)
        {
            return NotFound("Project not found.");
        }

        if (project.Languages.Contains(request.Language))
        {
            return Conflict("Language already exists in the project.");
        }

        project.Languages.Add(request.Language);
        await _projectRepository.Update(project);
        // Create a default property for the new language

        return Ok(project.Languages);
    }



    /// <summary>
    /// Set the specified project as the main project for the current user
    /// </summary>
    [HttpPut("{id}/set-main")]
    public async Task<IActionResult> SetMainProject(Guid companyId, Guid id)
    {
        var current = await _userProfile.GetCurrentUser();
        if (current == null) return Unauthorized();
        var projects = await _projectRepository.GetByCompanyId(companyId);
        var project = projects.FirstOrDefault(p => p.Id == id);
        if (project == null) return NotFound();
        await _userRepository.Update(new User
        {
            Id = current.Id,
            MainProjectId = project.Id,
            MainProjectName = project.Name,
        });
        return Ok();
    }

    /// <summary>
    /// Get all projects for a company
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid companyId)
    {
        var projects = await _projectRepository.GetByCompanyId(companyId);
        return Ok(projects);
    }

    /// <summary>
    /// Get project by id
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid companyId, Guid id)
    {
        var project = await _projectRepository.Read(companyId, id);
        if (project == null) return NotFound();

        var currentUser = await _userProfile.GetCurrentUser();
        if (currentUser == null)
            return Unauthorized("Invalid token");

        // Check if user has access to this company
        if (currentUser.CompanyId.HasValue && currentUser.CompanyId.Value != project.CompanyId)
            return StatusCode(403, "Access denied to this company under this project");

        return Ok(project);
    }

    /// <summary>
    /// Create a new project
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(Guid companyId, [FromBody] Project project)
    {
        if (project == null) return BadRequest();

        project.CompanyId = companyId;
        var created = await _projectRepository.Create(project);

        // Associate the company with the current user
        var currentUser = await _userProfile.GetCurrentUser();
        if (currentUser.MainProjectId == null)
        {
            await _userRepository.Update(new User
            {
                Id = currentUser.Id,
                MainProjectId = created.Id,
                MainProjectName = created.Name,
            });
        }

        return CreatedAtAction(nameof(GetById), new { companyId = companyId, id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing project
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid companyId, Guid id, [FromBody] Project project)
    {
        if (project == null || id != project.Id) return BadRequest();

        var exists = await _projectRepository.Exists(companyId, id);
        if (!exists) return NotFound();

        project.CompanyId = companyId;
        var updated = await _projectRepository.Update(project);
        if (updated == null) return StatusCode(500, "Update failed");
        return Ok(updated);
    }

    /// <summary>
    /// Delete a project
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid companyId, Guid id)
    {
        var exists = await _projectRepository.Exists(companyId, id);
        if (!exists) return NotFound();

        var deleted = await _projectRepository.Delete(companyId, id);
        if (!deleted) return StatusCode(500, "Delete failed");
        return NoContent();
    }
}