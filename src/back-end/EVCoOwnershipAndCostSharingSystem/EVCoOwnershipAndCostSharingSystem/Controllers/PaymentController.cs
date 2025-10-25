using BusinessLogicLayer.Others;
using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;
using Microsoft.AspNetCore.Mvc;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _ps;

        public PaymentController()
        {
            _ps = new PaymentService();
        }

        // ✅ API 1: Lấy thông tin chi phí của hợp đồng (Expense details)
        [HttpGet("expense/{expenseId}")]
        public IActionResult GetExpenseDetails(int expenseId)
        {
            try
            {
                var result = _ps.GetExpenseDetails(expenseId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ✅ API 2: Xác nhận thanh toán (Confirm Payment)
        [HttpPost("confirm")]
        public IActionResult ConfirmPayment(
            [FromForm] int settlementId,
            [FromForm] int payerId,
            [FromForm] decimal amount,
            [FromForm] string method,
            [FromForm] IFormFile proofImage)
        {
            try
            {
                // ✅ Lưu hình ảnh bill chuyển khoản
                string proofImageUrl = null;
                if (proofImage != null)
                {
                    var fileName = $"{Guid.NewGuid()}_{proofImage.FileName}";
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "proofs");
                    Directory.CreateDirectory(folderPath);
                    var fullPath = Path.Combine(folderPath, fileName);

                    using (var fs = new FileStream(fullPath, FileMode.Create))
                    {
                        proofImage.CopyTo(fs);
                    }

                    proofImageUrl = $"/proofs/{fileName}";
                }

                _ps.ConfirmPayment(settlementId, payerId, amount, method, proofImageUrl);
                return Ok("Payment confirmed successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ✅ API 3: Lấy danh sách các khoản thanh toán mà user liên quan đến trong 1 hợp đồng
        [HttpGet("contract/{contractId}/user/{userId}")]
        public IActionResult GetPaymentsForUser(int contractId, int userId)
        {
            try
            {
                var result = _ps.GetUserSettlementsForContract(contractId, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ✅ API 4: Lấy thông tin người nhận (creator của expense)
        [HttpGet("settlement/{settlementId}/receiver-info")]
        public IActionResult GetReceiverInfo(int settlementId)
        {
            try
            {
                var info = _ps.GetReceiverBankInfo(settlementId);
                return Ok(info);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("contract/{contractId}/user/{userId}/history")]
        public IActionResult GetUserExpenseHistory(int contractId, int userId)
        {
            try
            {
                var result = _ps.GetUserExpenseHistory(userId, contractId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("contract/{contractId}/expenses")]
        public IActionResult GetExpensesByContract(int contractId)
        {
            try
            {
                var result = _ps.GetExpensesByContract(contractId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}