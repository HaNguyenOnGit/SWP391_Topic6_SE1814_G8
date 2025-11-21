using BusinessLogicLayer.Others;
using BusinessLogicLayer.Services;
using Microsoft.AspNetCore.Mvc;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/proposal")]
    public class ProposalController : ControllerBase
    {
        private readonly ProposalService _ps;

        public ProposalController()
        {
            _ps = new ProposalService();
        }

        // ✅ API: Tạo đề xuất chi tiêu
        // ProposalController.cs
        [HttpPost("create")]
        public async Task<IActionResult> CreateProposal([FromBody] CreateProposalRequest req)
        {
            try
            {
                await _ps.CreateProposal(req);
                return Ok("Proposal created successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        // ✅ 2. Lấy danh sách đề xuất của hợp đồng của 1 user
        [HttpGet("contract/{contractId}/user/{userId}")]
        public IActionResult GetProposals(int contractId, int userId)
        {
            try
            {
                var result = _ps.GetProposalsForContract(contractId, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ✅ API: Xem chi tiết đề xuất
        [HttpGet("{proposalId}")]
        public IActionResult GetProposalDetails(int proposalId)
        {
            try
            {
                var db = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
                var proposal = db.ExpenseProposals
                    .Where(p => p.ProposalId == proposalId)
                    .Select(p => new
                    {
                        p.ProposalId,
                        p.ContractId,
                        p.Description,
                        ExpectedAmount = p.ExpectedAmount ?? 0,
                        p.Status,
                        p.AllocationRule,
                        p.CreatedAt,
                        ProposedBy = p.ProposedByNavigation != null ? p.ProposedByNavigation.FullName : "Unknown",
                        Votes = p.ProposalVotes != null ? p.ProposalVotes.Select(v => new
                        {
                            v.UserId,
                            Vote = v.Vote ?? "Pending",
                            v.VotedAt
                        }).ToList<dynamic>() : new List<dynamic>()
                    })
                    .FirstOrDefault();

                if (proposal == null)
                    return BadRequest("Proposal not found");

                // Lấy danh sách thành viên của hợp đồng và trạng thái vote của họ
                var memberList = db.ContractMembers
                    .Where(m => m.ContractId == proposal.ContractId)
                    .ToList();

                var voteDict = new Dictionary<int, string>();
                if (proposal.Votes != null)
                {
                    foreach (var v in proposal.Votes)
                    {
                        if (v != null && v.UserId != null)
                            voteDict[v.UserId] = v.Vote ?? "Pending";
                    }
                }

                var members = memberList
                    .Join(db.Users,
                        m => m.UserId,
                        u => u.UserId,
                        (m, u) => new
                        {
                            UserId = m.UserId,
                            FullName = u.FullName ?? "Unknown",
                            SharePercent = m.SharePercent,
                            Vote = voteDict.ContainsKey(m.UserId) ? voteDict[m.UserId] : "Pending"
                        })
                    .ToList();

                // Tính số tiền phải trả cho từng thành viên nếu rule là ByShare
                List<object> allocations = new List<object>();
                if (proposal.AllocationRule == "ByShare")
                {
                    allocations = members.Select(m => (object)new
                    {
                        m.UserId,
                        m.FullName,
                        PayPercent = m.SharePercent,
                        Amount = (proposal.ExpectedAmount * m.SharePercent) / 100,
                        Vote = m.Vote,
                        Type = "ByShare"
                    }).ToList();
                }
                // Nếu là SelfPaid thì chỉ người đề xuất trả toàn bộ
                else if (proposal.AllocationRule == "SelfPaid")
                {
                    // Chỉ người đề xuất trả toàn bộ
                    int proposerId = 0;
                    if (proposal.ProposedBy != null && int.TryParse(proposal.ProposedBy.ToString(), out proposerId))
                    {
                        var proposer = members.FirstOrDefault(m => m.UserId == proposerId);
                        if (proposer != null)
                        {
                            allocations.Add(new
                            {
                                proposer.UserId,
                                proposer.FullName,
                                PayPercent = 100,
                                Amount = proposal.ExpectedAmount,
                                Vote = proposer.Vote,
                                Type = "SelfPaid"
                            });
                        }
                    }
                }
                // Nếu là ByUsage thì tính theo usage log
                else if (proposal.AllocationRule == "ByUsage")
                {
                    // Tính theo usage log 30 ngày gần nhất
                    var now = DateTime.Now;
                    var startDate = now.AddDays(-30);
                    var usageData = db.UsageLogs
                        .Where(u => u.ContractId == proposal.ContractId && u.CheckOutTime >= startDate && u.CheckOutTime <= now && u.Distance != null)
                        .GroupBy(u => u.UserId)
                        .Select(g => new
                        {
                            UserId = g.Key,
                            TotalDistance = g.Sum(x => x.Distance ?? 0)
                        })
                        .ToList();
                    var totalDistance = usageData.Sum(u => u.TotalDistance);
                    foreach (var m in members)
                    {
                        var usage = usageData.FirstOrDefault(u => u.UserId == m.UserId);
                        decimal percent = 0;
                        if (totalDistance > 0 && usage != null)
                        {
                            percent = Math.Round((decimal)usage.TotalDistance / totalDistance * 100, 2);
                        }
                        var amount = totalDistance > 0 && usage != null ? Math.Round(proposal.ExpectedAmount * percent / 100, 2) : 0;
                        allocations.Add(new
                        {
                            m.UserId,
                            m.FullName,
                            PayPercent = percent,
                            Amount = amount,
                            Vote = m.Vote,
                            Type = "ByUsage"
                        });
                    }
                }
                return Ok(new
                {
                    Proposal = proposal,
                    Members = members,
                    Allocations = allocations
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ✅ API: Bình chọn (chấp nhận / từ chối) Đề Xuất của User đã tạo trong hợp đồng
        [HttpPost("{proposalId}/user/{userId}/vote")]
        public IActionResult VoteProposal(int proposalId, int userId, [FromBody] VoteRequest req)
        {
            try
            {
                _ps.VoteProposal(proposalId, userId, req.Decision);
                return Ok("Vote submitted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        public class VoteRequest
        {
            public string Decision { get; set; } = string.Empty;
        }
    }
}
