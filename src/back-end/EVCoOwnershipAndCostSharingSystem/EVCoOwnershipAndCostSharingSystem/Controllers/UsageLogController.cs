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
        // API: Tỷ lệ sử dụng của các đồng sở hữu trong hợp đồng
        [HttpGet("ratio/{contractId}")]
        public IActionResult GetUsageRatio(int contractId)
        {
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            // Lấy danh sách thành viên hợp đồng
            var members = context.ContractMembers
                .Where(m => m.ContractId == contractId)
                .Select(m => new { m.UserId, m.User.FullName })
                .ToList();

            // Lấy usage log 30 ngày gần nhất
            var now = DateTime.Now;
            var startDate = now.AddDays(-30);
            var usageData = context.UsageLogs
                .Where(u => u.ContractId == contractId && u.CheckOutTime >= startDate && u.CheckOutTime <= now && u.Distance != null)
                .GroupBy(u => u.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    TotalDistance = g.Sum(x => x.Distance ?? 0)
                })
                .ToList();

            var totalDistance = usageData.Sum(u => u.TotalDistance);
            var result = new List<object>();
            foreach (var member in members)
            {
                var usage = usageData.FirstOrDefault(u => u.UserId == member.UserId);
                decimal percent = 0;
                if (totalDistance > 0 && usage != null)
                {
                    percent = Math.Round((decimal)usage.TotalDistance / totalDistance * 100, 2);
                }
                result.Add(new
                {
                    userId = member.UserId,
                    username = member.FullName,
                    percent = percent
                });
            }
            return Ok(result);
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

        // API: Lấy lịch sử hành trình và tổng quãng đường đã đi của user trong contract
        [HttpGet("usage-history")]
        public IActionResult GetUsageHistory([FromQuery] int userId, [FromQuery] int contractId)
        {
            var usageLogService = new UsageLogService();
            // Lấy danh sách các chuyến đi của user trong contract
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var usageLogs = context.UsageLogs
                .Where(u => u.UserId == userId && u.ContractId == contractId)
                .OrderBy(u => u.CheckOutTime)
                .ToList();

            var totalDistance = usageLogs.Sum(u => u.Distance);
            var trips = usageLogs.Select(u => new
            {
                u.UsageId,
                u.CheckOutTime,
                u.CheckInTime,
                Distance = u.Distance
            });

            return Ok(new
            {
                TotalDistance = totalDistance,
                Trips = trips
            });
        }

        // API: Check quyền checkin (userId phải trùng UsingBy hoặc UsingBy null)
        [HttpGet("can-checkin")]
        public IActionResult CanCheckin([FromQuery] int contractId, [FromQuery] int userId)
        {
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var contract = context.Contracts.FirstOrDefault(c => c.ContractId == contractId);
            if (contract == null)
                return NotFound("Contract not found");
            if (contract.UsingBy == null || contract.UsingBy == userId)
                return Ok(new { CanCheckin = true });
            return Ok(new { CanCheckin = false });
        }

        // API: Check trạng thái contract đã checkin chưa (dựa vào UsingBy)
        [HttpGet("is-checked-in")]
        public IActionResult IsCheckedIn([FromQuery] int contractId)
        {
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var contract = context.Contracts.FirstOrDefault(c => c.ContractId == contractId);
            if (contract == null)
                return NotFound("Contract not found");
            return Ok(new { IsCheckedIn = contract.UsingBy != null });
        }

        // API: Checkin
        [HttpPost("checkin")]
        public IActionResult Checkin([FromBody] CheckInOutRequest req)
        {
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var contract = context.Contracts.FirstOrDefault(c => c.ContractId == req.ContractId);
            if (contract == null)
                return NotFound("Contract not found");
            if (contract.UsingBy != null && contract.UsingBy != req.UserId)
                return BadRequest("Xe đang được sử dụng bởi user khác!");
            // Lưu usage log mới (chỉ lưu checkin, checkout sẽ update sau)
            var usageLog = new DataAccessLayer.Entities.UsageLog
            {
                ContractId = req.ContractId,
                UserId = req.UserId,
                OdometerStart = req.Odometer,
                CheckInTime = DateTime.Now,
                ProofImageStart = req.ProofImage
            };
            context.UsageLogs.Add(usageLog);
            contract.UsingBy = req.UserId;
            contract.Status = "Active"; // Set status to Active on checkin
            context.SaveChanges();
            return Ok("Checkin thành công!");
        }

        // API: Checkout
        [HttpPost("checkout")]
        public IActionResult Checkout([FromBody] CheckInOutRequest req)
        {
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var contract = context.Contracts.FirstOrDefault(c => c.ContractId == req.ContractId);
            if (contract == null)
                return NotFound("Contract not found");
            if (contract.UsingBy != req.UserId)
                return BadRequest("Bạn không phải người đang sử dụng xe!");
            // Tìm usage log gần nhất chưa có checkout
            var usageLog = context.UsageLogs
                .Where(u => u.ContractId == req.ContractId && u.UserId == req.UserId && u.CheckOutTime == null)
                .OrderByDescending(u => u.CheckInTime)
                .FirstOrDefault();
            if (usageLog == null)
                return BadRequest("Không tìm thấy phiên checkin phù hợp!");
            usageLog.OdometerEnd = req.Odometer;
            usageLog.CheckOutTime = DateTime.Now;
            usageLog.ProofImageEnd = req.ProofImage;
            usageLog.Distance = usageLog.OdometerEnd - usageLog.OdometerStart;
            contract.UsingBy = null;
            contract.Status = "Available"; // Set status to Available on checkout
            context.SaveChanges();
            return Ok("Checkout thành công!");
        }

        // API: Tổng quãng đường của một contract (theo tất cả usage logs)
        [HttpGet("contract-total-distance")]
        public IActionResult GetContractTotalDistance([FromQuery] int contractId)
        {
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            // Sum distance, handle null and empty sets
            var totalDistance = context.UsageLogs
                .Where(u => u.ContractId == contractId)
                .Sum(u => (int?)u.Distance) ?? 0;

            return Ok(new { ContractId = contractId, TotalDistance = totalDistance });
        }

        // DTO cho checkin/checkout
        public class CheckInOutRequest
        {
            public int ContractId { get; set; }
            public int UserId { get; set; }
            public int Odometer { get; set; }
            public string? ProofImage { get; set; }
        }
    }
}