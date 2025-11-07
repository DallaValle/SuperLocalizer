using System.Collections.Generic;
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
    /// Set main project for current user
    /// </summary>
    [HttpPut("{id}/user")]
    public async Task<IActionResult> SetMainProject(int companyId, int id)
    {
        var current = await _userProfile.GetCurrentUser();
        if (current == null) return Unauthorized();
        var projects = await _projectRepository.GetAllAsync(companyId);
        var project = projects.FirstOrDefault(p => p.Id == id);
        if (project == null) return NotFound();
        await _userRepository.PartialUpdateAsync(new User
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
    public async Task<IActionResult> GetAll(int companyId)
    {
        var projects = await _projectRepository.GetAllAsync(companyId);
        return Ok(projects);
    }

    /// <summary>
    /// Get project by id
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int companyId, int id)
    {
        var project = await _projectRepository.GetByIdAsync(companyId, id);
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
    public async Task<IActionResult> Create(int companyId, [FromBody] Project project)
    {
        if (project == null) return BadRequest();

        project.CompanyId = companyId;
        var created = await _projectRepository.CreateAsync(project);

        // Associate the company with the current user
        var currentUser = await _userProfile.GetCurrentUser();
        if (currentUser.MainProjectId == null)
        {
            await _userRepository.PartialUpdateAsync(new User
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
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int companyId, int id, [FromBody] Project project)
    {
        if (project == null || id != project.Id) return BadRequest();

        var exists = await _projectRepository.ExistsAsync(companyId, id);
        if (!exists) return NotFound();

        project.CompanyId = companyId;
        var updated = await _projectRepository.UpdateAsync(project);
        if (updated == null) return StatusCode(500, "Update failed");
        return Ok(updated);
    }

    /// <summary>
    /// Delete a project
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int companyId, int id)
    {
        var exists = await _projectRepository.ExistsAsync(companyId, id);
        if (!exists) return NotFound();

        var deleted = await _projectRepository.DeleteAsync(companyId, id);
        if (!deleted) return StatusCode(500, "Delete failed");
        return NoContent();
    }
}