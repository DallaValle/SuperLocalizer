using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace SuperLocalizer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SyncController : ControllerBase
    {
        public SyncController()
        {
            // POST api/sync/export
            // POST api/sync/import
        }
    }

    public class SyncRequest
    {
        public string MainLanguage { get; set; }
        public List<byte[]> JsonFiles { get; set; }
    }
}