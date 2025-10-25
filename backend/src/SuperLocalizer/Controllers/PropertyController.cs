using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Model;
using System.Collections.Generic;
using System.Linq;

namespace SuperLocalizer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertyController : ControllerBase
    {
        // In a real application, this would be injected from a service/repository
        private readonly List<Property> _properties = new List<Property>();

        public PropertyController(List<Property> properties)
        {
            _properties = properties;
        }

        // POST api/property/search
        [HttpPost("search")]
        public ActionResult<SearchResponse> Search([FromBody] SearchRequest request)
        {
            if (request == null)
            {
                return BadRequest("Search request is required");
            }

            var query = _properties.AsQueryable();

            // Filter by key if provided
            if (!string.IsNullOrEmpty(request.Key))
            {
                query = query.Where(p => p.Key.Contains(request.Key, System.StringComparison.OrdinalIgnoreCase));
            }

            // Filter by language if provided
            if (!string.IsNullOrEmpty(request.Language))
            {
                query = query.Where(p => p.Values.Any(v => v.Language.Equals(request.Language, System.StringComparison.OrdinalIgnoreCase)));
            }

            // Filter by text if provided
            if (!string.IsNullOrEmpty(request.Text))
            {
                query = query.Where(p => p.Values.Any(v => v.Text.Contains(request.Text, System.StringComparison.OrdinalIgnoreCase)));
            }

            // Filter by verification status if provided
            if (request.IsVerified.HasValue)
            {
                query = query.Where(p => p.Values.Any(v => v.IsVerified == request.IsVerified.Value));
            }

            // Filter by review status if provided
            if (request.IsReviewed.HasValue)
            {
                query = query.Where(p => p.Values.Any(v => v.IsReviewed == request.IsReviewed.Value));
            }

            // Apply ordering
            if (!string.IsNullOrEmpty(request.OrderBy))
            {
                switch (request.OrderBy.ToLower())
                {
                    case "key":
                        query = request.OrderDirection?.ToLower() == "desc"
                            ? query.OrderByDescending(p => p.Key)
                            : query.OrderBy(p => p.Key);
                        break;
                    case "insertdate":
                        query = request.OrderDirection?.ToLower() == "desc"
                            ? query.OrderByDescending(p => p.InsertDate)
                            : query.OrderBy(p => p.InsertDate);
                        break;
                    case "updatedate":
                        query = request.OrderDirection?.ToLower() == "desc"
                            ? query.OrderByDescending(p => p.UpdateDate)
                            : query.OrderBy(p => p.UpdateDate);
                        break;
                    default:
                        query = query.OrderBy(p => p.Key); // Default ordering
                        break;
                }
            }
            else
            {
                query = query.OrderBy(p => p.Key); // Default ordering
            }

            // Get total count before pagination
            var totalItems = query.Count();

            // Apply pagination
            var page = request.Page ?? 1;
            var size = request.Size ?? 10;

            if (page < 1) page = 1;
            if (size < 1) size = 10;
            if (size > 100) size = 100; // Limit max page size

            var skip = (page - 1) * size;
            var items = query.Skip(skip).Take(size).ToList();

            var result = new SearchResponse
            {
                Items = items,
                Page = page,
                Size = size,
                TotalItems = totalItems,
                TotalPages = (int)System.Math.Ceiling((double)totalItems / size)
            };

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

            var property = _properties.FirstOrDefault(p => p.Key.Equals(id, System.StringComparison.OrdinalIgnoreCase));
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

            return Ok(property);
        }
    }
}