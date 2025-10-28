using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;
using System;
using System.Collections.Generic;

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
        /// Get history items within a specific date range
        /// </summary>
        /// <param name="fromDate">Start date (YYYY-MM-DD format)</param>
        /// <param name="toDate">End date (YYYY-MM-DD format)</param>
        /// <returns>List of history items within the date range</returns>
        [HttpGet("date/{fromDate}/{toDate}")]
        public ActionResult<List<HistoryItem>> GetHistoryByDateRange(string fromDate, string toDate)
        {
            if (!DateTime.TryParse(fromDate, out var from))
            {
                return BadRequest($"Invalid fromDate format: {fromDate}. Expected format: YYYY-MM-DD");
            }

            if (!DateTime.TryParse(toDate, out var to))
            {
                return BadRequest($"Invalid toDate format: {toDate}. Expected format: YYYY-MM-DD");
            }

            if (from > to)
            {
                return BadRequest("fromDate cannot be later than toDate");
            }

            // Set time to end of day for toDate to include the entire day
            to = to.Date.AddDays(1).AddTicks(-1);

            var history = _historyRepository.GetHistoryByDateRange(from, to);
            return Ok(history);
        }

        /// <summary>
        /// Get history items for a specific user
        /// </summary>
        /// <param name="userName">The username to filter by</param>
        /// <returns>List of history items for the specified user</returns>
        [HttpGet("user/{userName}")]
        public ActionResult<List<HistoryItem>> GetHistoryByUser(string userName)
        {
            if (string.IsNullOrWhiteSpace(userName))
            {
                return BadRequest("Username cannot be empty");
            }

            var history = _historyRepository.GetHistoryByUserName(userName);
            return Ok(history);
        }

        /// <summary>
        /// Get history items for a specific property value
        /// </summary>
        /// <param name="valueId">The value ID to get history for</param>
        /// <returns>List of history items for the specified value</returns>
        [HttpGet("property/value/{valueId}")]
        public ActionResult<List<HistoryItem>> GetHistoryByValueId(Guid? valueId)
        {
            if (valueId is null)
            {
                return BadRequest("ValueId cannot be empty");
            }

            var history = _historyRepository.GetHistoryById(valueId.Value);
            return Ok(history);
        }

        /// <summary>
        /// Get all history items (for testing/debugging purposes)
        /// </summary>
        /// <returns>All history items</returns>
        [HttpGet]
        public ActionResult<List<HistoryItem>> GetAllHistory()
        {
            // Get history for the last 30 days by default
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var now = DateTime.UtcNow;

            var history = _historyRepository.GetHistoryByDateRange(thirtyDaysAgo, now);
            return Ok(history);
        }
    }
}