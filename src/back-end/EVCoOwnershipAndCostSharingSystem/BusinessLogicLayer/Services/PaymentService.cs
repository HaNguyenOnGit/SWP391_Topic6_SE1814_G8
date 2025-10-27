using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace BusinessLogicLayer.Services
{
    public class PaymentService
    {
        private readonly ExpenseRepository _expenseRepo;
        private readonly UserRepository _userRepo;
        private readonly SettlementRepository _settlementRepo;

        public PaymentService()
        {
            _expenseRepo = new ExpenseRepository();
            _userRepo = new UserRepository();
            _settlementRepo = new SettlementRepository();
        }

        // ✅ 1. Lấy chi tiết Expense (bao gồm allocations)
        public object GetExpenseDetails(int expenseId)
        {
            var expense = _expenseRepo.GetExpenseWithAllocations(expenseId);
            if (expense == null) throw new Exception("Expense not found");

            var allocations = _expenseRepo.GetAllocationsByExpense(expenseId)
                .Select(a => new
                {
                    a.AllocationId,
                    a.UserId,
                    a.Amount,
                    a.Status,
                    User = a.User == null ? null : new
                    {
                        a.User.UserId,
                        a.User.FullName,
                        a.User.BankName,
                        a.User.BankAccount
                    }
                }).ToList();

            return new
            {
                expense.ExpenseId,
                expense.Description,
                expense.Amount,
                expense.AllocationRule,
                expense.Status,
                Allocations = allocations
            };
        }

        // ✅ 2. Xác nhận thanh toán (update Settlement)
        public void ConfirmPayment(int settlementId, int payerId, decimal amountPaid, string method, string proofImageUrl)
        {
            using var db = new EvcoOwnershipAndCostSharingSystemContext();

            var settlement = db.Settlements
                .Include(s => s.Allocation)
                .ThenInclude(a => a.Expense)
                .FirstOrDefault(s => s.SettlementId == settlementId);

            if (settlement == null)
                throw new Exception("Settlement not found");
            if (settlement.PayerId != payerId)
                throw new Exception("Không phải người thanh toán hợp lệ");

            settlement.Amount = amountPaid;
            settlement.Method = method ?? "Banking";
            settlement.PaymentDate = DateTime.Now;
            settlement.Status = "Paid";
            settlement.ProofImageUrl = proofImageUrl;

            db.Settlements.Update(settlement);
            db.SaveChanges();

            // ✅ Lấy tất cả settlement cùng Expense
            var expenseId = settlement.Allocation.ExpenseId;
            var allSettlements = db.Settlements
                .Include(s => s.Allocation)
                .Where(s => s.Allocation.ExpenseId == expenseId)
                .ToList();

            if (allSettlements.All(s => s.Status == "Paid"))
            {
                var exp = db.Expenses.FirstOrDefault(e => e.ExpenseId == expenseId);
                if (exp != null)
                {
                    exp.Status = "Completed";
                    db.Expenses.Update(exp);
                    db.SaveChanges();
                }
            }
        }

        // ✅ 3. Lấy danh sách khoản thanh toán user liên quan tới 1 contract
        public object GetUserSettlementsForContract(int contractId, int userId)
        {
            // Vì repo chưa có GetSettlementsByContractAndUser nên lọc thủ công
            var settlements = _settlementRepo.GetByContract(contractId)
                .Where(s => s.PayerId == userId)
                .Select(s => new
                {
                    s.SettlementId,
                    Expense = s.Allocation.Expense == null ? null : new
                    {
                        s.Allocation.Expense.ExpenseId,
                        s.Allocation.Expense.Description,
                        s.Allocation.Expense.Amount,
                        s.Allocation.Expense.Status,
                        s.Allocation.Expense.ExpenseDate
                    },
                    s.Amount,
                    s.Method,
                    s.Status,
                    s.PaymentDate,
                    s.ProofImageUrl
                }).ToList();

            return settlements;
        }

        // ✅ 4. Lấy thông tin người nhận (Receiver)
        public object GetReceiverBankInfo(int settlementId)
        {
            var settlement = _settlementRepo.GetById(settlementId);
            if (settlement == null) throw new Exception("Settlement not found");

            // Dùng GetUserById thay vì GetById
            var receiver = _userRepo.GetUserById(settlement.ReceiverId);
            if (receiver == null) throw new Exception("Receiver not found");

            return new
            {
                receiver.UserId,
                receiver.FullName,
                receiver.BankName,
                receiver.BankAccount
            };
        }
        public object GetUserExpenseHistory(int userId, int contractId)
        {
            var history = _expenseRepo.GetUserExpenseHistory(userId, contractId)
                .Select(e => new
                {
                    e.ExpenseId,
                    e.Description,
                    e.ExpenseDate,
                    e.Amount,
                    e.Status,
                    Allocations = e.ExpenseAllocations.Select(a => new
                    {
                        a.UserId,
                        a.Amount,
                        a.Status
                    })
                }).ToList();

            return history;
        }
        public object GetExpensesByContract(int contractId)
        {
            var expenses = _expenseRepo.GetByContract(contractId)
                .Select(e => new
                {
                    e.ExpenseId,
                    e.Description,
                    e.Amount,
                    e.Status,
                    e.AllocationRule,
                    e.ExpenseDate
                }).ToList();

            return expenses;
        }
        public object GetPaymentDetails(int settlementId)
        {
            using var db = new EvcoOwnershipAndCostSharingSystemContext();

            var settlement = db.Settlements
                .Where(s => s.SettlementId == settlementId)
                .Select(s => new
                {
                    s.SettlementId,
                    s.AllocationId,
                    s.PayerId,
                    PayerName = s.Payer.FullName,
                    s.ReceiverId,
                    ReceiverName = s.Receiver.FullName,
                    s.Amount,
                    s.Method,
                    s.Status,
                    s.PaymentDate,
                    s.ProofImageUrl,
                    ExpenseDescription = s.Allocation.Expense.Description,
                    ContractId = s.Allocation.Expense.ContractId
                })
                .FirstOrDefault();

            return settlement;
        }

    }
}
