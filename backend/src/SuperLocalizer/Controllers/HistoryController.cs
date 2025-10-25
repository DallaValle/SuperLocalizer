using Microsoft.AspNetCore.Mvc;

namespace SuperLocalizer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoryController : ControllerBase
    {
        public HistoryController()
        {
            // POST api/history/{propertyId}/action
            // POST api/history/{propertyId}/undo
            // POST api/history/{propertyId}/redo
            // GET api/history/{propertyId}/actions
        }
    }
}