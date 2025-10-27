using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using BusinessLogicLayer.Others;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services
{
    public class ProposalService
    {
        private readonly EvcoOwnershipAndCostSharingSystemContext _db;
        private readonly UserRepository _userRepo;
        private readonly ExpenseRepository _expenseRepo;
        private readonly EmailService _emailService;

        private const string systemEmail = "phuhung258@gmail.com";
        private const string systemAppPassword = "zrsw mewp lawc osxa";

        public ProposalService()
        {
            _db = new EvcoOwnershipAndCostSharingSystemContext();
            _userRepo = new UserRepository();
            _expenseRepo = new ExpenseRepository();

            _emailService = new EmailService(
                smtpServer: "smtp.gmail.com",
                smtpPort: 587,
                smtpUser: systemEmail,
                smtpPass: systemAppPassword,
                fromEmail: systemEmail
            );
        }

        // ✅ 1. Tạo đề xuất chi tiêu
        public async Task CreateProposal(CreateProposalRequest request)
        {
            try
            {
                var proposal = new ExpenseProposal
                {
                    ContractId = request.ContractId,
                    ProposedBy = request.ProposedBy,
                    Description = request.Description,
                    ExpectedAmount = request.ExpectedAmount,
                    AllocationRule = request.AllocationRule,
                    Status = "Pending",
                    CreatedAt = DateTime.Now
                };

                _db.ExpenseProposals.Add(proposal);
                await _db.SaveChangesAsync();

                // ✅ Tạo vote cho tất cả thành viên trong hợp đồng
                var members = _db.ContractMembers
                    .Where(m => m.ContractId == request.ContractId)
                    .Select(m => m.UserId)
                    .ToList();

                foreach (var userId in members)
                {
                    var vote = new ProposalVote
                    {
                        ProposalId = proposal.ProposalId,
                        UserId = userId,
                        Vote = (userId == request.ProposedBy) ? "Accepted" : "Pending",
                        VotedAt = DateTime.Now
                    };
                    _db.ProposalVotes.Add(vote);
                }

                await _db.SaveChangesAsync();

                // ✅ Nếu tất cả vote = Accepted → tạo Expense & Settlement luôn
                var votes = _db.ProposalVotes.Where(v => v.ProposalId == proposal.ProposalId).ToList();
                if (votes.All(v => v.Vote == "Accepted"))
                {
                    proposal.Status = "Approved";
                    await _db.SaveChangesAsync();
                    ConvertProposalToExpense(proposal);
                }

                // ✅ Gửi email cho các co-owner (trừ người tạo)
                foreach (var userId in members.Where(id => id != request.ProposedBy))
                {
                    var user = _userRepo.GetUserById(userId);
                    if (user != null && !string.IsNullOrEmpty(user.Email))
                    {
                        string subject = $"[EVCO] Đề xuất chi tiêu mới trong hợp đồng #{request.ContractId}";
                        string body = $@"
                            <p>Xin chào {user.FullName},</p>
                            <p>Có một đề xuất chi tiêu mới trong hợp đồng #{request.ContractId}.</p>
                            <p><b>Mô tả:</b> {request.Description}</p>
                            <p><b>Số tiền dự kiến:</b> {request.ExpectedAmount:N0} VND</p>
                            <p>Vui lòng đăng nhập hệ thống để xác nhận hoặc từ chối đề xuất này.</p>
                            <p>Trân trọng,<br><b>EVCO System</b></p>";

                        try
                        {
                            await _emailService.SendEmailAsync(user.Email, subject, body);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"⚠️ Không thể gửi email cho {user.Email}: {ex.Message}");
                        }
                    }
                }

                Console.WriteLine($"✅ Proposal #{proposal.ProposalId} đã được tạo và lưu vào DB.");
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException != null
                    ? $"{ex.Message} | Inner: {ex.InnerException.Message}"
                    : ex.Message;
                Console.WriteLine($"❌ Lỗi khi tạo đề xuất: {msg}");
                throw new Exception(msg);
            }
        }

        // ✅ 2. Lấy danh sách đề xuất của hợp đồng
        public object GetProposalsForContract(int contractId, int userId)
        {
            return _db.ExpenseProposals
                .Where(p => p.ContractId == contractId)
                .Select(p => new
                {
                    p.ProposalId,
                    p.Description,
                    p.ExpectedAmount,
                    p.Status,
                    p.AllocationRule,
                    p.CreatedAt,
                    ProposedBy = p.ProposedByNavigation.FullName,
                    Votes = p.ProposalVotes.Select(v => new
                    {
                        v.UserId,
                        v.Vote,
                        v.VotedAt
                    })
                }).ToList();
        }

        // ✅ 3. Xem chi tiết đề xuất
        public object GetProposalDetails(int proposalId)
        {
            var proposal = _db.ExpenseProposals
                .Where(p => p.ProposalId == proposalId)
                .Select(p => new
                {
                    p.ProposalId,
                    p.ContractId,
                    p.Description,
                    p.ExpectedAmount,
                    p.Status,
                    p.AllocationRule,
                    p.CreatedAt,
                    ProposedBy = p.ProposedByNavigation.FullName,
                    Votes = p.ProposalVotes.Select(v => new
                    {
                        v.UserId,
                        v.Vote,
                        v.VotedAt
                    })
                }).FirstOrDefault();

            if (proposal == null)
                throw new Exception("Proposal not found");

            return proposal;
        }

        // ✅ 4. Bình chọn cho đề xuất
        public void VoteProposal(int proposalId, int userId, string vote)
        {
            var pv = _db.ProposalVotes.FirstOrDefault(x => x.ProposalId == proposalId && x.UserId == userId);
            if (pv == null)
                throw new Exception("Vote not found for this user/proposal");

            pv.Vote = vote;
            pv.VotedAt = DateTime.Now;
            _db.ProposalVotes.Update(pv);
            _db.SaveChanges();

            CheckProposalStatus(proposalId);
        }

        // ✅ 5. Kiểm tra kết quả voting và xử lý
        private void CheckProposalStatus(int proposalId)
        {
            var proposal = _db.ExpenseProposals.FirstOrDefault(p => p.ProposalId == proposalId);
            if (proposal == null) return;

            var votes = _db.ProposalVotes.Where(v => v.ProposalId == proposalId).ToList();

            if (votes.All(v => v.Vote == "Accepted"))
            {
                proposal.Status = "Approved";
                _db.SaveChanges();
                ConvertProposalToExpense(proposal);
            }
            else if (votes.Any(v => v.Vote == "Rejected"))
            {
                proposal.Status = "Rejected";
                _db.SaveChanges();
            }
        }

        // ✅ 6. Tự động tạo Expense + Allocations + Settlements
        private void ConvertProposalToExpense(ExpenseProposal proposal)
        {
            Console.WriteLine($"🔹 ConvertProposalToExpense cho Proposal #{proposal.ProposalId}");

            try
            {
                var expense = new Expense
                {
                    ContractId = proposal.ContractId,
                    ProposalId = proposal.ProposalId,
                    Description = proposal.Description,
                    Amount = proposal.ExpectedAmount ?? 0,
                    AllocationRule = proposal.AllocationRule,
                    Type = "Custom",
                    ExpenseDate = DateOnly.FromDateTime(DateTime.Now),
                    CreatedBy = proposal.ProposedBy,
                    //Status = "Pending"
                };

                _db.Expenses.Add(expense);
                _db.SaveChanges();

                var members = _db.ContractMembers
                    .Where(m => m.ContractId == proposal.ContractId)
                    .ToList();

                var allocations = new List<ExpenseAllocation>();
                foreach (var m in members)
                {
                    var amount = (expense.Amount * m.SharePercent) / 100;
                    allocations.Add(new ExpenseAllocation
                    {
                        ExpenseId = expense.ExpenseId,
                        UserId = m.UserId,
                        Amount = amount,
                        Status = "Unpaid"
                    });
                }

                _db.ExpenseAllocations.AddRange(allocations);
                _db.SaveChanges();

                var settlements = new List<Settlement>();
                foreach (var alloc in allocations)
                {
                    settlements.Add(new Settlement
                    {
                        AllocationId = alloc.AllocationId,
                        PayerId = alloc.UserId,
                        ReceiverId = proposal.ProposedBy,
                        Amount = alloc.Amount,
                        //Status = "Pending",
                        Method = "Banking"
                    });
                }

                _db.Settlements.AddRange(settlements);
                _db.SaveChanges();

                //expense.Status = "AwaitingPayment";
                _db.Expenses.Update(expense);
                _db.SaveChanges();

                Console.WriteLine($"✅ Expense #{expense.ExpenseId} tạo thành công ({allocations.Count} allocations, {settlements.Count} settlements).");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi ConvertProposalToExpense: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"🔍 Inner: {ex.InnerException.Message}");
            }
        }
    }
}
