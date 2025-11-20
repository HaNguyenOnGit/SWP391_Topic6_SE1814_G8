using BusinessLogicLayer.Others;
using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        // ✅ API 5: Lấy chi tiết thanh toán (theo SettlementId)
        [HttpGet("settlement/{settlementId}")]
        public IActionResult GetPaymentDetails(int settlementId)
        {
            try
            {
                var result = _ps.GetPaymentDetails(settlementId);
                if (result == null)
                    return NotFound($"Không tìm thấy thanh toán với ID {settlementId}");

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // API: Lấy tất cả settlement của user ở mọi hợp đồng
        [HttpGet("user/{userId}/all-settlements")]
        public IActionResult GetAllSettlementsForUser(int userId)
        {
            var db = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var settlements = db.Settlements
                .Where(s => s.PayerId == userId && s.Status == "Paid")
                .Select(s => new
                {
                    settlementId = s.SettlementId,
                    expenseName = s.Allocation.Expense.Description,
                    userPaidAmount = s.Amount,
                    totalExpenseAmount = s.Allocation.Expense.Amount,
                    receiverName = s.Receiver.FullName,
                    paymentDate = s.PaymentDate,
                    contractName = s.Allocation.Expense.Contract.VehicleName
                })
                .OrderByDescending(s => s.paymentDate)
                .ToList();
            return Ok(settlements);
        }

        // API: Lịch sử thanh toán đã hoàn thành của user trong hợp đồng
        [HttpGet("contract/{contractId}/user/{userId}/settlement-history")]
        public IActionResult GetUserSettlementHistory(int contractId, int userId)
        {
            var db = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var settlements = db.Settlements
                .Where(s => s.Allocation.Expense.ContractId == contractId && s.PayerId == userId && s.Status == "Paid")
                .Select(s => new
                {
                    settlementId = s.SettlementId,
                    expenseName = s.Allocation.Expense.Description,
                    userPaidAmount = s.Amount,
                    totalExpenseAmount = s.Allocation.Expense.Amount,
                    receiverName = s.Receiver.FullName,
                    paymentDate = s.PaymentDate
                })
                .OrderByDescending(s => s.paymentDate)
                .ToList();
            return Ok(settlements);
        }
        // API: Lấy danh sách expense của user trong hợp đồng
        [HttpGet("contract/{contractId}/user/{userId}/user-expenses")]
        public IActionResult GetUserExpenses(int contractId, int userId)
        {
            var db = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var allocations = db.ExpenseAllocations
                .Include(a => a.Expense)
                .Where(a => a.Expense != null && a.Expense.ContractId == contractId && a.UserId == userId)
                .ToList()
                .Select(a =>
                {
                    var settlement = db.Settlements.FirstOrDefault(s => s.AllocationId == a.AllocationId && s.PayerId == userId);
                    return new
                    {
                        expenseId = a.ExpenseId,
                        expenseName = a.Expense != null ? a.Expense.Description : "",
                        userAmount = a.Amount,
                        status = settlement != null ? settlement.Status : "Unpaid"
                    };
                })
                .ToList();
            return Ok(allocations);
        }

        // API: Chi tiết expense cho user
        [HttpGet("expense/{expenseId}/user/{userId}/detail")]
        public IActionResult GetExpenseDetailForUser(int expenseId, int userId)
        {
            var db = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var expense = db.Expenses
                .Include(e => e.ExpenseAllocations)
                .FirstOrDefault(e => e.ExpenseId == expenseId);
            if (expense == null)
                return NotFound("Expense not found");

            var userAlloc = expense.ExpenseAllocations.FirstOrDefault(a => a.UserId == userId);
            var userAmount = userAlloc != null ? userAlloc.Amount : 0;

            var owners = expense.ExpenseAllocations
                .Select(a => new
                {
                    userId = a.UserId,
                    fullName = db.Users.FirstOrDefault(u => u.UserId == a.UserId)?.FullName ?? "",
                    percent = expense.Amount > 0 ? Math.Round((decimal)a.Amount / expense.Amount * 100, 2) : 0,
                    amount = a.Amount
                })
                .ToList();
            var result = new
            {
                expenseName = expense.Description,
                totalAmount = expense.Amount,
                userAmount = userAmount,
                allocationRule = expense.AllocationRule,
                owners = owners
            };
            return Ok(result);
        }
        // API: Lấy toàn bộ thông tin User + lịch sử chi tiêu
        [HttpGet("users-with-expense-history")]
        public IActionResult GetAllUsersWithExpenseHistory()
        {
            var db = new EvcoOwnershipAndCostSharingSystemContext();

            var users = db.Users.ToList(); // Tách khỏi expression tree

            var result = new List<object>();

            foreach (var u in users)
            {
                var allocations = db.ExpenseAllocations
                    .Include(a => a.Expense)
                        .ThenInclude(e => e.Contract)
                    .Where(a => a.UserId == u.UserId)
                    .ToList();

                var expenses = allocations.Select(a =>
                {
                    var settlement = db.Settlements
                        .Include(s => s.Receiver)
                        .FirstOrDefault(s => s.AllocationId == a.AllocationId && s.PayerId == u.UserId);

                    return new
                    {
                        expenseId = a.ExpenseId,
                        expenseName = a.Expense.Description,
                        totalExpenseAmount = a.Expense.Amount,
                        userAmount = a.Amount,
                        allocationRule = a.Expense.AllocationRule,
                        contractId = a.Expense.ContractId,
                        contractName = a.Expense.Contract.VehicleName,
                        status = settlement != null ? settlement.Status : "Unpaid",
                        settlementId = settlement?.SettlementId,
                        paymentDate = settlement?.PaymentDate,
                        receiver = settlement?.Receiver?.FullName,
                        proofImageUrl = settlement?.ProofImageUrl
                    };
                }).OrderByDescending(e => e.paymentDate).ToList();

                result.Add(new
                {
                    userId = u.UserId,
                    fullName = u.FullName,
                    email = u.Email,
                    phone = u.PhoneNumber,
                    bankName = u.BankName,
                    bankAccount = u.BankAccount,
                    expenses = expenses
                });
            }

            return Ok(result);
        }
        // API: Lấy toàn bộ thông tin User + chi tiêu trong hợp đồng
        [HttpGet("contract/{contractId}/users-expenses")]
        public IActionResult GetAllUsersExpensesInContract(int contractId)
        {
            var db = new EvcoOwnershipAndCostSharingSystemContext();

            // Lấy tất cả user trong hợp đồng
            var usersInContract = db.ContractMembers
                .Include(cm => cm.User)
                .Where(cm => cm.ContractId == contractId)
                .Select(cm => cm.User)
                .ToList();

            // Tạo danh sách kết quả
            var result = usersInContract.Select(user =>
            {
                // Lấy tất cả expense allocations của user trong hợp đồng
                var allocations = db.ExpenseAllocations
                    .Include(a => a.Expense)
                    .Where(a => a.Expense != null && a.Expense.ContractId == contractId && a.UserId == user.UserId)
                    .ToList();

                // Map dữ liệu chi tiêu
                var expenseHistory = allocations.Select(a =>
                {
                    var settlement = db.Settlements.FirstOrDefault(s => s.AllocationId == a.AllocationId && s.PayerId == user.UserId);
                    return new
                    {
                        expenseId = a.ExpenseId,
                        expenseName = a.Expense.Description,
                        userAmount = a.Amount,
                        status = settlement != null ? settlement.Status : "Unpaid"
                    };
                }).ToList();

                return new
                {
                    userId = user.UserId,
                    fullName = user.FullName,
                    email = user.Email,
                    expenses = expenseHistory
                };
            }).ToList();

            return Ok(result);
        }
    }
}