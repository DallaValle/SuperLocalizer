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
        private readonly IHistoryRepository _historyRepository;

        public PropertyController(IPropertyRepository propertyRepository, IHistoryRepository historyRepository)
        {
            _propertyRepository = propertyRepository;
            _historyRepository = historyRepository;
        }


        /// <summary>
        /// Search properties based on criteria
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Update a property's value for a specific language
        /// </summary>
        /// <param name="id"></param>
        /// <param name="language"></param>
        /// <param name="request"></param>
        /// <returns></returns>
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

            // Capture previous values for history
            var previousText = value.Text;
            var previousIsVerified = value.IsVerified;
            var previousIsReviewed = value.IsReviewed;

            // Determine what's changing
            var textChanged = !string.IsNullOrEmpty(request.Text) && request.Text != previousText;
            var verifiedChanged = request.IsVerified.HasValue && request.IsVerified.Value != previousIsVerified;
            var reviewedChanged = request.IsReviewed.HasValue && request.IsReviewed.Value != previousIsReviewed;

            // Save history if any relevant changes are made
            if (textChanged || verifiedChanged || reviewedChanged)
            {
                _historyRepository.SaveHistory(
                    value.Id,
                    previousText,
                    textChanged ? request.Text : previousText,
                    verifiedChanged ? previousIsVerified : null,
                    verifiedChanged ? request.IsVerified.Value : null,
                    reviewedChanged ? previousIsReviewed : null,
                    reviewedChanged ? request.IsReviewed.Value : null
                );
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