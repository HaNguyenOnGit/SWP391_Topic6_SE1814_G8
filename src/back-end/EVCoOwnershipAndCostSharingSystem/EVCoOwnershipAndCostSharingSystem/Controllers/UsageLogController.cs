using BusinessLogicLayer.Others;
using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;
using Microsoft.AspNetCore.Mvc;
using static System.IO.Directory;
using static System.IO.File;

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
        // API: Thêm usage log
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

        // API: Check quyền checkin (chỉ trả true nếu UsingBy trùng với userId; nếu UsingBy == null trả về false)
        [HttpGet("can-checkin")]
        public IActionResult CanCheckin([FromQuery] int contractId, [FromQuery] int userId)
        {
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var contract = context.Contracts.FirstOrDefault(c => c.ContractId == contractId);
            if (contract == null)
                return NotFound("Contract not found");
            // Only allow checkin when UsingBy is explicitly set to the same userId.
            // If UsingBy is null, return false as requested.
            if (contract.UsingBy != null && contract.UsingBy == userId)
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
        public IActionResult Checkin([FromForm] CheckInRequest req)
        {
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var contract = context.Contracts.FirstOrDefault(c => c.ContractId == req.ContractId);
            if (contract == null)
                return NotFound("Contract not found");
            if (contract.UsingBy != null && contract.UsingBy != req.UserId)
                return BadRequest("Xe đang được sử dụng bởi user khác!");
            // Lưu usage log mới (chỉ lưu checkin, checkout sẽ update sau)
            var proofImageInFile = req.ProofImageInFile;
            if (proofImageInFile != null)
            {
                var usageLog = new DataAccessLayer.Entities.UsageLog
                {
                    ContractId = req.ContractId,
                    UserId = req.UserId,
                    OdometerStart = req.Odometer,
                    CheckInTime = DateTime.Now,
                    ProofImageStart = proofImageInFile.FileName
                };
                context.UsageLogs.Add(usageLog);
                context.SaveChanges();
                //Xu ly anh va folder
                var savedLog = context.UsageLogs
                    .FirstOrDefault(u => u.ContractId == req.ContractId && u.UserId == req.UserId && u.Distance == null);
                if (savedLog != null)
                {
                    string rootFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "CheckInOutImages");
                    string checkInOutSubfolder = savedLog.UsageId + "-" + savedLog.ContractId + "-" + savedLog.UserId;
                    string checkInOutPath = Path.Combine(rootFolder, checkInOutSubfolder);
                    if (!Directory.Exists(checkInOutPath))
                    {
                        CreateDirectory(checkInOutPath);
                    }
                    string proofImageInPath = Path.Combine(checkInOutPath, proofImageInFile.FileName);
                    using (var stream = new FileStream(proofImageInPath, FileMode.Create))
                    {
                        proofImageInFile.CopyTo(stream);
                    }
                    //Luu duong dan anh vao db
                    string relativePathImageIn = "/CheckInOutImages/" + checkInOutSubfolder + "/" + proofImageInFile.FileName;
                    savedLog.ProofImageStart = relativePathImageIn;
                    context.SaveChanges();
                }
            }
            else
            {
                var usageLog = new DataAccessLayer.Entities.UsageLog
                {
                    ContractId = req.ContractId,
                    UserId = req.UserId,
                    OdometerStart = req.Odometer,
                    CheckInTime = DateTime.Now,
                    ProofImageStart = null
                };
                context.UsageLogs.Add(usageLog);
                context.SaveChanges();
            }
            return Ok("Checkin thành công!");
        }

        // API: Checkout
        [HttpPost("checkout")]
        public IActionResult Checkout([FromForm] CheckOutRequest req)
        {
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var contract = context.Contracts.FirstOrDefault(c => c.ContractId == req.ContractId);
            if (contract == null)
                return NotFound("Contract not found");
            // Không check UsingBy nữa, chỉ dựa vào UsageLog
            // Tìm usage log gần nhất chưa có checkout
            var usageLog = context.UsageLogs
                .Where(u => u.ContractId == req.ContractId && u.UserId == req.UserId && u.CheckOutTime == null)
                .OrderByDescending(u => u.CheckInTime)
                .FirstOrDefault();
            if (usageLog == null)
                return BadRequest("Không tìm thấy phiên checkin phù hợp!");
            // Cập nhật thông tin checkout
            // Có vẻ chưa xử lý ảnh checkout
            var proofImageOutFile = req.ProofImageOutFile;
            if (proofImageOutFile != null)
            {
                string rootFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "CheckInOutImages");
                string checkInOutSubfolder = usageLog.UsageId + "-" + usageLog.ContractId + "-" + usageLog.UserId;
                string checkInOutPath = Path.Combine(rootFolder, checkInOutSubfolder);
                if (!Directory.Exists(checkInOutPath))
                {
                    CreateDirectory(checkInOutPath);
                }
                string proofImageOutPath = Path.Combine(checkInOutPath, proofImageOutFile.FileName);
                using (var stream = new FileStream(proofImageOutPath, FileMode.Create))
                {
                    proofImageOutFile.CopyTo(stream);
                }
                //Luu duong dan anh vao db
                string relativePathImageOut = "/CheckInOutImages/" + checkInOutSubfolder + "/" + proofImageOutFile.FileName;
                usageLog.ProofImageEnd = relativePathImageOut;
            }
            usageLog.OdometerEnd = req.Odometer;
            usageLog.CheckOutTime = DateTime.Now;
            usageLog.Distance = usageLog.OdometerEnd - usageLog.OdometerStart;
            context.SaveChanges();

            // Cảnh báo nếu UsingBy không match
            string message = "Checkout thành công!";
            if (contract.UsingBy == null || contract.UsingBy != req.UserId)
            {
                message += " Lưu ý: Bạn nên checkout đúng giờ so với lịch hẹn để tránh xung đột.";
            }
            return Ok(message);
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

        // DTO cho checkin
        public class CheckInRequest
        {
            public int ContractId { get; set; }
            public int UserId { get; set; }
            public int Odometer { get; set; }
            public IFormFile? ProofImageInFile { get; set; }
        }
        // DTO cho checkout
        public class CheckOutRequest
        {
            public int ContractId { get; set; }
            public int UserId { get; set; }
            public int Odometer { get; set; }
            public IFormFile? ProofImageOutFile { get; set; }
        }
    }
}