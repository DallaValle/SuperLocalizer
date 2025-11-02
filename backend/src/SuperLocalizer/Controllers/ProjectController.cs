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

    [HttpGet]
    public async Task<IActionResult> GetAll(int companyId)
    {
        var projects = await _projectRepository.GetAllAsync(companyId);
        return Ok(projects);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int companyId, int id)
    {
        var project = await _projectRepository.GetByIdAsync(companyId, id);
        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> Create(int companyId, [FromBody] Project project)
    {
        if (project == null) return BadRequest();

        var currentUser = await _userProfile.GetCurrentUser();

        // Check if user already has a company
        if (currentUser.MainProjectId.HasValue)
            return BadRequest("User already has an associated project");

        var created = await _projectRepository.CreateAsync(project);

        // Associate the company with the current user
        currentUser.MainProjectId = created.Id;
        await _userRepository.PartialUpdateAsync(new User
        {
            Id = currentUser.Id,
            MainProjectId = currentUser.MainProjectId,
        });

        project.CompanyId = companyId;
        return CreatedAtAction(nameof(GetById), new { companyId = companyId, id = created.Id }, created);
    }

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