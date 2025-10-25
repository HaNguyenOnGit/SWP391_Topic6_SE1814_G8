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

        // ✅ 1. Tạo đề xuất chi tiêu
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


        // ✅ 2. Lấy danh sách đề xuất của hợp đồng
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

        // ✅ 3. Xem chi tiết đề xuất
        [HttpGet("{proposalId}")]
        public IActionResult GetProposalDetails(int proposalId)
        {
            try
            {
                var result = _ps.GetProposalDetails(proposalId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ✅ 4. Bình chọn (chấp nhận / từ chối)
        [HttpPost("{proposalId}/user/{userId}/vote")]
        public IActionResult VoteProposal(int proposalId, int userId, [FromBody] string vote)
        {
            try
            {
                _ps.VoteProposal(proposalId, userId, vote);
                return Ok("Vote submitted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
