using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;
using System.Linq;

namespace SuperLocalizer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertyController : ControllerBase
    {
        private readonly IPropertyRepository _propertyRepository;

        public PropertyController(IPropertyRepository propertyRepository)
        {
            _propertyRepository = propertyRepository;
        }


        // POST api/property/search
        [HttpPost("search")]
        public ActionResult<SearchResponse> Search([FromBody] SearchRequest request)
        {
            if (request == null)
            {
                return BadRequest("Search request is required");
            }

            var result = _propertyRepository.GetProperties(request);

            return Ok(result);
        }

        // PATCH api/property/{id}/{language}
        [HttpPatch("{id}/{language}")]
        public ActionResult UpdatePropertyValue(string id, string language, [FromBody] UpdateValueRequest request)
        {
            if (request == null)
            {
                return BadRequest("Update request is required");
            }

            var property = _propertyRepository.GetPropertyByKey(id);
            if (property == null)
            {
                return NotFound($"Property with key '{id}' not found");
            }

            var value = property.Values.FirstOrDefault(v => v.Language.Equals(language, System.StringComparison.OrdinalIgnoreCase));
            if (value == null)
            {
                return NotFound($"Value for language '{language}' not found in property '{id}'");
            }

            // Update the value properties
            if (!string.IsNullOrEmpty(request.Text))
            {
                value.Text = request.Text;
            }

            if (request.IsVerified.HasValue)
            {
                value.IsVerified = request.IsVerified.Value;
            }

            if (request.IsReviewed.HasValue)
            {
                value.IsReviewed = request.IsReviewed.Value;
            }

            property.UpdateDate = System.DateTime.UtcNow;

            _propertyRepository.UpdateProperty(property);

            return Ok(property);
        }
    }
}