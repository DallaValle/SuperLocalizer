using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Repository;

namespace SuperLocalizer.Controllers;

[ApiController]
[Route("company")]
public class CompanyController : ControllerBase
{
    private readonly ICompanyRepository _companyRepository;

    public CompanyController(ICompanyRepository companyRepository)
    {
        _companyRepository = companyRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var companies = await _companyRepository.GetAllAsync();
        return Ok(companies);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var company = await _companyRepository.GetByIdAsync(id);
        if (company == null) return NotFound();
        return Ok(company);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Model.Company company)
    {
        if (company == null) return BadRequest();

        var created = await _companyRepository.CreateAsync(company);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Model.Company company)
    {
        if (company == null || id != company.Id) return BadRequest();

        var exists = await _companyRepository.ExistsAsync(id);
        if (!exists) return NotFound();

        var updated = await _companyRepository.UpdateAsync(company);
        if (updated == null) return StatusCode(500, "Update failed");
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var exists = await _companyRepository.ExistsAsync(id);
        if (!exists) return NotFound();

        var deleted = await _companyRepository.DeleteAsync(id);
        if (!deleted) return StatusCode(500, "Delete failed");
        return NoContent();
    }
}