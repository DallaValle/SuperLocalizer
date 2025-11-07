using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;
using SuperLocalizer.Services;

namespace SuperLocalizer.Controllers;

[ApiController]
[Authorize]
[Route("company")]
public class CompanyController : ControllerBase
{
    private readonly ICompanyRepository _companyRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserProfile _userProfile;

    public CompanyController(ICompanyRepository companyRepository, IUserRepository userRepository, IUserProfile userProfile)
    {
        _companyRepository = companyRepository;
        _userRepository = userRepository;
        _userProfile = userProfile;
    }

    /// <summary>
    /// Get company by id
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var currentUser = await _userProfile.GetCurrentUser();
        if (currentUser == null)
            return Unauthorized("Invalid token");

        // Check if user has access to this company
        if (currentUser.CompanyId.HasValue && currentUser.CompanyId.Value != id)
            return StatusCode(403, "Access denied to this company");

        var company = await _companyRepository.GetByIdAsync(id);
        if (company == null) return NotFound();
        return Ok(company);
    }

    /// <summary>
    /// Create a new company
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Company company)
    {
        if (company == null) return BadRequest();

        var currentUser = await _userProfile.GetCurrentUser();

        // Check if user already has a company
        if (currentUser.CompanyId.HasValue)
            return BadRequest("User already has an associated company");

        // Associate the company with the current user
        var created = await _companyRepository.CreateAsync(company);
        await _userRepository.PartialUpdateAsync(new User
        {
            Id = currentUser.Id,
            CompanyId = company.Id,
            CompanyName = company.Name,
        });

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing company
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Company company)
    {
        if (company == null || id != company.Id) return BadRequest();

        var currentUser = await _userProfile.GetCurrentUser();
        if (currentUser == null)
            return Unauthorized("Invalid token");

        // Check if user has access to this company
        if (currentUser.CompanyId.HasValue && currentUser.CompanyId.Value != id)
            return StatusCode(403, "Access denied to this company");

        var exists = await _companyRepository.ExistsAsync(id);
        if (!exists) return NotFound();

        var updated = await _companyRepository.UpdateAsync(company);
        if (updated == null) return StatusCode(500, "Update failed");
        return Ok(updated);
    }

    /// <summary>
    /// Delete a company
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var currentUser = await _userProfile.GetCurrentUser();
        if (currentUser == null)
            return Unauthorized("Invalid token");

        // Check if user has access to this company
        if (currentUser.CompanyId.HasValue && currentUser.CompanyId.Value != id)
            return StatusCode(403, "Access denied to this company");

        var exists = await _companyRepository.ExistsAsync(id);
        if (!exists) return NotFound();

        var deleted = await _companyRepository.DeleteAsync(id);
        if (!deleted) return StatusCode(500, "Delete failed");

        // Remove company association from user
        // if (currentUser.CompanyId == id)
        // {
        //     currentUser.CompanyId = null;
        //     await _userRepository.UpdateAsync(currentUser);
        // }

        return NoContent();
    }
}