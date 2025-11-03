using BusinessLogicLayer.Others;
using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;
using Microsoft.AspNetCore.Mvc;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/contract")]
    public class ContractController : ControllerBase
    {

        [HttpPost("update-member-status")]
        public IActionResult UpdateMemberStatus([FromBody] UpdateMemberStatusRequest req)
        {
            // req gồm: contractId, userId, status
            var allowedStatus = new[] { "Rejected", "Confirmed" };
            if (!allowedStatus.Contains(req.Status))
                return BadRequest("Invalid status value");
            var result = _cms.UpdateMemberStatus(req.ContractId, req.UserId, req.Status);
            if (!result) return NotFound("Member not found in contract");

            // Kiểm tra trạng thái phê duyệt của các đồng sở hữu
            var contractRepo = new DataAccessLayer.Repositories.ContractRepository();
            var contract = contractRepo.GetContractById(req.ContractId);
            if (contract == null) return NotFound("Contract not found");
            var memberStatuses = contract.ContractMembers.Select(m => m.Status).ToList();
            if (memberStatuses.Any(s => s == "Rejected"))
            {
                contract.Status = "Cancelled";
                contractRepo.UpdateContract(contract); // Update status
                return Ok("Contract rejected by a member. Status updated to Cancelled.");
            }
            if (memberStatuses.All(s => s == "Confirmed"))
            {
                contract.Status = "Available";
                contractRepo.UpdateContract(contract); // Update status
                return Ok("All members confirmed. Contract status updated to Available.");
            }
            return Ok("Status updated successfully");
        }

        public class UpdateMemberStatusRequest
        {
            public int ContractId { get; set; }
            public int UserId { get; set; }
            public string Status { get; set; }
        }
        private readonly ContractService _cs;
        private readonly UserService _us;
        private readonly ContractMemberService _cms;
        private readonly UsageLogService _uls;
        private readonly ReservationService _rs;
        private readonly ProposalService _pss;
        private readonly PaymentService _pms;
        public ContractController()
        {
            _cs = new ContractService();
            _us = new UserService();
            _cms = new ContractMemberService();
            _uls = new UsageLogService();
            _rs = new ReservationService();
            _pss = new ProposalService();
            _pms = new PaymentService();
        }
        //Chức năng quằn nhất từng làm
        //Xóa hợp đồng kết hợp xóa các dữ liệu có liên quan tới hợp đồng
        //Mà nó lại ràng buộc khóa ngoại với nhiều bảng khác
        [HttpDelete("deleteContract/{contractId}")]
        public IActionResult DeleteContract([FromRoute] int contractId)
        {
            //Xóa trước dữ liệu có liên quan tới hợp đồng đó trong bảng UsageLogs
            _uls.DeleteUsageLogsByContractId(contractId);
            //Xoá trước dữ liệu có liên quan tới hợp đồng đó trong bảng Reservations
            _rs.DeleteReservationsByContractId(contractId);
            //Lấy các khoản đề xuất chi tiêu liên quan tới hợp đồng đó trong bảng ExpenseProposals
            List<ExpenseProposal> proposals = _pss.GetExpenseProposalsByContractId(contractId);
            //Lấy các phiếu vote liên quan tới mã proposal (proposalId) trong bảng ProposalVotes
            foreach (var proposal in proposals)
            {
                var proposalVoteList = _pss.GetProposalVotesByProposalId(proposal.ProposalId);
                if (proposalVoteList == null)
                {
                    continue;
                }
                _pss.DeleteProposalVotesList(proposalVoteList);//1
            }
            //Khoan xóa các đề xuất chi tiêu liên quan tới hợp đồng đó trong bảng ExpenseProposals
            //Giờ tới phần dữ liệu liên quan tới Expenses
            //Đầu tiên lấy toàn bộ khoản chi tiêu tương ứng với contractId
            List<Expense> expenses = _pms.GetExpenseListByContractId(contractId);
            foreach (var expense in expenses)
            {
                //Chạy qua từng khoản chi tiêu để lấy toàn bộ các phân bổ chi tiêu tương ứng
                var expenseAllocations = _pms.GetAllocationListByExpenseId(expense.ExpenseId);
                //Rồi lại duyệt qua từng phân bổ chi tiêu để lấy khoản thanh toán tương ứng trong bảng Settlements
                //Nếu không có phân bổ chi tiêu thì continue
                //Nếu có thì xóa khoản thanh toán trong bảng Settlements
                foreach (var allocation in expenseAllocations)
                {
                    var settlement = _pms.GetSettlementByAllocationId(allocation.AllocationId);
                    if (settlement == null)
                    {
                        continue;
                    }
                    _pms.DeleteSettlement(settlement);//2
                }
                //Xóa toàn bộ phân bổ chi tiêu trong bảng ExpenseAllocations
                _pms.DeleteAllocationList(expenseAllocations);//3
            }
            //Giờ là xóa toàn bộ khoản chi tiêu trong bảng Expenses
            _pms.DeleteExpenseList(expenses);//4
            //Xóa toàn bộ đề xuất chi tiêu trong bảng ExpenseProposals
            _pms.DeleteExpenseProposalList(proposals);//5
            //Xóa toàn bộ đồng sở hữu trong bảng ContractMembers
            var contractMembers = _cms.GetContractMembersByContractId(contractId);
            foreach (var member in contractMembers)
            {
                _cms.DeleteContractMember(contractId, member.UserId);//6
            }
            //Cuối cùng mới xóa hợp đồng trong bảng Contracts
            _cs.DeleteContract(contractId);//7
            return Ok("Contract and related data deleted successfully.");
        }

        //Hiển thị tóm tắt toàn bộ hợp đồng
        //Dành cho admin
        [HttpGet("contractListSummary")]
        public IActionResult GetContractListSummary()
        {
            List<Contract> contracts = _cs.GetAllContracts();
            List<ContractSummary> contractSummaries = new List<ContractSummary>();
            foreach (var contract in contracts)
            {
                List<MemberSummary> memberSummaries = new List<MemberSummary>();
                //Tim kiem toan bo dong so huu theo contractId
                List<ContractMember> members = _cms.GetContractMembersByContractId(contract.ContractId);
                //Add tung dong so huu vo danh sach cac dong so huu tuong ung voi ma hop dong
                //Chi co FullName, PhoneNumber, SharePercent
                //FullName va PhoneNumber nam o bang User
                foreach (var member in members)
                {
                    var account = _us.GetUserById(member.UserId);
                    MemberSummary ms = new MemberSummary(
                        account.FullName,
                        account.PhoneNumber,
                        member.SharePercent
                    );
                    memberSummaries.Add(ms);
                }
                //Them tom tat hop dong vao danh sach hop dong da tom tat
                ContractSummary contractSummary = new ContractSummary(
                    contract.ContractId,
                    contract.Model,
                    contract.LicensePlate,
                    contract.StartDate,
                    memberSummaries,
                    contract.Status
                );
                contractSummaries.Add(contractSummary);
            }
            return Ok(contractSummaries);
        }

        [HttpGet("contract-detail/{contractId}")]
        public IActionResult GetContractDetail(int contractId)
        {
            var contract = _cs.GetContractById(contractId);
            if (contract == null)
                return NotFound("Contract not found");

            // Lấy danh sách member
            var members = contract.ContractMembers.Select(cm => new
            {
                cm.UserId,
                cm.User.FullName,
                cm.User.PhoneNumber,
                cm.SharePercent,
                cm.Status,
                cm.JoinedAt
            }).ToList();

            var result = new
            {
                contract.ContractId,
                contract.VehicleName,
                contract.LicensePlate,
                contract.Model,
                contract.StartDate,
                contract.Status,
                Members = members
            };
            return Ok(result);
        }

        [HttpGet("user-contracts/{userId}")]
        public IActionResult GetContractsByUserId(int userId)
        {
            // Lấy danh sách contractId mà user này tham gia
            var contractIds = _cms.GetContractIdsByUserId(userId);
            var contracts = new List<object>();
            foreach (var contractId in contractIds)
            {
                var contract = _cs.GetContractById(contractId);
                if (contract != null)
                {
                    contracts.Add(new
                    {
                        contract.ContractId,
                        contract.VehicleName,
                        contract.Status
                    });
                }
            }
            return Ok(contracts);
        }
        [HttpPost("contractRequest")]
        public async Task<IActionResult> CreateContract([FromBody] ContractRequest contractRequest)
        {
            // Extract data from the request
            string vehicleName = contractRequest.VehicleName;
            string licensePlate = contractRequest.LicensePlate;
            string model = contractRequest.Model;
            DateOnly startDate = contractRequest.StartDate;
            string status = contractRequest.Status;
            _cs.CreateContract(vehicleName, licensePlate, model, startDate, status);
            // Extract member details
            List<MemberRequest> members = contractRequest.Members;
            var contract = _cs.GetContractByPlate(licensePlate);
            foreach (var member in members)
            {
                var user = _us.GetUserByPhone(member.PhoneNumber);
                // Assuming contract is not null since it was just created
                int contractId = contract.ContractId;
                int userId = user.UserId;
                decimal sharePercent = member.SharePercent;
                DateTime joinedAt = DateTime.Now;
                string coOwnerStatus = "Pending";
                _cms.AddContractMember(contractId, userId, sharePercent, joinedAt, coOwnerStatus);
                // Send notification to member
                await _cms.SendNotificationToMember(userId, contractId);
            }
            return Ok("Contract and members added successfully.");
        }
        //Ngưng hợp đồng
        //Chuyển về pending
        [HttpPatch("pauseContract/{contractId}")]
        public IActionResult PauseContract([FromRoute] int contractId)
        {
            //Dau tien la ngung hop dong
            var contract = _cs.GetContractById(contractId);
            contract.Status = "Pending";
            _cs.UpdateContract(contract);
            //Sau do chuyen trang thai tat ca dong so huu ve pending
            List<ContractMember> contractMembers = _cms.GetContractMembersByContractId(contractId);
            foreach (var member in contractMembers)
            {
                _cms.UpdateMemberStatus(contractId, member.UserId, "Pending");
            }
            return Ok("Contract paused successfully.");
        }
    }
}
