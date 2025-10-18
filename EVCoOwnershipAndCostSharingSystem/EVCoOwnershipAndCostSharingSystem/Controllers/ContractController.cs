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
