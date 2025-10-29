using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;

namespace SuperLocalizer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryRepository _historyRepository;

        public HistoryController(IHistoryRepository historyRepository)
        {
            _historyRepository = historyRepository;
        }

        /// <summary>
        /// Get history for a specific value with search criteria
        /// </summary>
        [HttpPost("search")]
        public ActionResult<SearchResponse<HistoryItem>> Search([FromBody] SearchHistoryRequest request)
        {
            if (request == null)
            {
                return BadRequest("Search request is required");
            }

            var result = _historyRepository.SearchHistory(request);

            return Ok(result);
        }
    }
}