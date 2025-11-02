using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;

namespace SuperLocalizer.Controllers;

[ApiController]
[Route("company/{companyId}/project")]
public class ProjectController : ControllerBase
{
    private readonly IProjectRepository _projectRepository;

    public ProjectController(IProjectRepository companyRepository)
    {
        _projectRepository = companyRepository;
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

        project.CompanyId = companyId;
        var created = await _projectRepository.CreateAsync(project);
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