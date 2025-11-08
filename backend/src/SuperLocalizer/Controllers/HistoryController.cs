using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;

namespace SuperLocalizer.Controllers
{
    [Authorize]
    [ApiController]
    [Route("project/{projectId}/history")]
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
        public async Task<ActionResult<SearchResponse<HistoryItem>>> Search(int projectId, [FromBody] SearchHistoryRequest request)
        {
            if (request == null)
            {
                return BadRequest("Search request is required");
            }

            var result = await _historyRepository.SearchHistory(projectId, request);

            return Ok(result);
        }
    }
}