using BusinessLogicLayer.Others;
using BusinessLogicLayer.Services;
using Microsoft.AspNetCore.Mvc;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/check")]
    public class UsageLogController : ControllerBase
    {
        private readonly UsageLogService _uls;
        public UsageLogController()
        {
            _uls = new UsageLogService();
        }
        [HttpPost("usageLogRequest")]
        public IActionResult AddUsageLog([FromBody] UsageLogRequest usageLogRequest)
        {
            int contractId = usageLogRequest.ContractId;
            int userId = usageLogRequest.UserId;
            int odometerStart = usageLogRequest.OdometerStart;
            int odometerEnd = usageLogRequest.OdometerEnd;
            int distance = odometerEnd - odometerStart;
            DateTime checkOutTime = usageLogRequest.CheckOutTime;
            DateTime checkInTime = usageLogRequest.CheckInTime;
            string proofImageStart = usageLogRequest.ProofImageStart ?? string.Empty;
            string proofImageEnd = usageLogRequest.ProofImageEnd ?? string.Empty;
            _uls.AddUsageLog(contractId, userId, odometerStart, odometerEnd,
                             checkOutTime, checkInTime, distance,
                             proofImageStart, proofImageEnd);
            return Ok("Usage log added successfully.");
        }
    }
}
