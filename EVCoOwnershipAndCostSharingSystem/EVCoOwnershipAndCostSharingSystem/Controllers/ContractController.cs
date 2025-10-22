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

        // Create contract with members
        [HttpPost("contractRequest")]
        public IActionResult CreateContract([FromBody] ContractRequest contractRequest)
        {
            // Extract data from the request
            string vehicleName = contractRequest.VehicleName;
            string licensePlate = contractRequest.LicensePlate;
            string model = contractRequest.Model;
            DateOnly startDate = contractRequest.StartDate;
            string status = contractRequest.Status;
            int creator = contractRequest.Creator;
            _cs.CreateContract(vehicleName, licensePlate, model, startDate, status, creator);
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

        // Get contract by user ID
        // After login, create token to get userId
        // This API is used to get contract info after login
        // Only the user who creates the contract can get contract info
        // May need to change later
        [HttpGet("getContract/{userId}")]
        public ActionResult<Contract?> GetContractById([FromRoute] int userId)
        {
            var contract = _cs.GetContractById(userId);
            if (contract == null)
            {
                return NotFound("Contract not found for the given user.");
            }
            return Ok(contract);
        }

        // Get co-owner list by user ID (the one who creates the contract)
        // After getting contract
        // Get userId first, then get contractId, then get co-owner list
        // Used in checkin and checkout to show co-owners
        // And also be used to show co-owners in contract detail page
        [HttpGet("getCoOwner/{userId}")]
        public ActionResult<List<ContractMember>> GetCoOwnerList([FromRoute] int userId)
        {
           int contractId = _cs.GetContractId(userId);
           var coOwners = _cms.GetCoOwnerList(contractId);
           return Ok(coOwners);
        }

        //Get contractId by member name
        //Find user in user table first to get userId by fullName
        //Then use this id to find contractId in contractMember table
        //Use this in choosing member for checkin and checkout
        //This API do this
        [HttpGet("getContractIdByMemberName/{fullName}")]
        public ActionResult<int> GetContractIdByMemberName([FromRoute] string fullName)
        {
            int contractId = _cms.GetContractIdByMemberName(fullName);
            return Ok(contractId);
        }
    }
}
