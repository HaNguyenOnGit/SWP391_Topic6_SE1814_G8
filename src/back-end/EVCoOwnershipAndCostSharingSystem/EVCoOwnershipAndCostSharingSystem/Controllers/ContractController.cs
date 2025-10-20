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
        private readonly ContractService _cs;
        private readonly UserService _us;
        private readonly ContractMemberService _cms;
        public ContractController()
        {
            _cs = new ContractService();
            _us = new UserService();
            _cms = new ContractMemberService();
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
        public IActionResult CreateContract([FromBody] ContractRequest contractRequest)
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
            }
            return Ok("Contract and members added successfully.");
        }
    }
}
