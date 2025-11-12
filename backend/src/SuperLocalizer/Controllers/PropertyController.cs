using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;
using SuperLocalizer.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SuperLocalizer.Controllers
{
    [Authorize]
    [ApiController]
    [Route("project/{projectId}/property")]
    public class PropertyController : ControllerBase
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IHistoryRepository _historyRepository;
        private readonly IUserProfile _userProfile;

        public PropertyController(IPropertyRepository propertyRepository, IHistoryRepository historyRepository, IUserProfile userProfile)
        {
            _propertyRepository = propertyRepository;
            _historyRepository = historyRepository;
            _userProfile = userProfile;
        }

        /// <summary>
        /// Get property by key
        /// </summary>
        [HttpGet("{key}")]
        public ActionResult<Property> GetPropertyByKey(int projectId, string key)
        {
            var property = _propertyRepository.GetPropertyByKey(projectId, key);
            if (property == null)
            {
                return NotFound($"Property with key '{key}' not found");
            }
            return Ok(property);
        }

        /// <summary>
        /// Search properties based on criteria
        /// </summary>
        /// <param name="projectId"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost("search")]
        public ActionResult<SearchResponse<Property>> Search(int projectId, [FromBody] SearchPropertyRequest request)
        {
            if (request == null)
            {
                return BadRequest("Search request is required");
            }

            var result = _propertyRepository.GetProperties(projectId, request);

            return Ok(result);
        }

        [HttpPost("bulk-update")]
        public ActionResult BulkUpdateProperties(int projectId, [FromBody] BulkUpdatePropertiesRequest request)
        {
            if (request == null || request.Query == null)
            {
                return BadRequest("Bulk update request and query are required");
            }

            var properties = _propertyRepository.GetProperties(projectId, request.Query).Items;

            foreach (var property in properties)
            {
                foreach (var value in property.Values)
                {
                    if (request.IsReviewed.HasValue)
                    {
                        value.IsReviewed = request.IsReviewed.Value;
                    }
                    if (request.IsVerified.HasValue)
                    {
                        value.IsVerified = request.IsVerified.Value;
                    }
                }
                property.UpdateDate = System.DateTime.UtcNow;
                _propertyRepository.UpdateProperty(projectId, property);
            }

            return Ok(new { UpdatedCount = properties.Count });
        }

        /// <summary>
        /// Update a property's value for a specific language
        /// </summary>
        /// <param name="projectId"></param>
        /// <param name="id"></param>
        /// <param name="language"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPatch("{id}/{language}")]
        public async Task<ActionResult> UpdatePropertyValue(int projectId, string id, string language, [FromBody] UpdateValueRequest request)
        {
            if (request == null)
            {
                return BadRequest("Update request is required");
            }

            var property = _propertyRepository.GetPropertyByKey(projectId, id);
            if (property == null)
            {
                return NotFound($"Property with key '{id}' not found");
            }

            var value = property.Values.FirstOrDefault(v => v.Language.Equals(language, System.StringComparison.OrdinalIgnoreCase));
            if (value == null)
            {
                return NotFound($"Value for language '{language}' not found in property '{id}'");
            }

            // Capture previous values for history
            var previousValue = JsonConvert.SerializeObject(value);

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

            _propertyRepository.UpdateProperty(projectId, property);
            // Save history -> TODO can be done in background
            await _historyRepository.SaveHistory(
                projectId,
                value.Key,
                await _userProfile.GetCurrentUser(),
                JsonConvert.DeserializeObject<Value>(previousValue),
                JsonConvert.DeserializeObject<Value>(JsonConvert.SerializeObject(value)));
            return Ok(property);
        }

        /// <summary>
        /// Create a new property
        /// </summary>
        [HttpPut()]
        public ActionResult<Property> CreateProperty(int projectId, [FromBody] CreatePropertyRequest request)
        {
            if (request == null)
            {
                return BadRequest("Create request is required");
            }

            var existingProperty = _propertyRepository.GetPropertyByKey(projectId, request.Key);
            if (existingProperty != null)
            {
                return Conflict($"Property with key '{request.Key}' already exists");
            }

            var newProperty = new Property
            {
                Key = request.Key,
                Values = request.Values ?? new List<Value>(),
                InsertDate = System.DateTime.UtcNow,
                UpdateDate = System.DateTime.UtcNow
            };

            _propertyRepository.AddProperty(projectId, newProperty);

            return CreatedAtAction(nameof(GetPropertyByKey), new { projectId = projectId, key = newProperty.Key }, newProperty);
        }
    }
}