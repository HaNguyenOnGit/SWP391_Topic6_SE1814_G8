using BusinessLogicLayer.Others;
using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;
using Microsoft.AspNetCore.Mvc;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/contract")]
    public class ContractController: ControllerBase
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
            string licensePlate = contractRequest.LicensePlate;
            string model = contractRequest.Model;
            DateOnly startDate = contractRequest.StartDate;
            string status = contractRequest.Status;
            string email = contractRequest.Email;
            // Create the contract
            _cs.CreateContract(licensePlate, model, startDate, status);
            // Verify the contract creation
            var contract = _cs.GetContractByPlate(licensePlate);
            if (contract == null)
            {
                return BadRequest("Failed to create contract");
            }
            // Associate the contract with the member using email
            var user = _us.GetUserByEmail(email);
            if (user == null)
            {
                return NotFound("User not found");
            }
            // Add the user as a contract member with default values
            int contractId = contract.ContractId;
            int userId = user.UserId;
            decimal sharePercentage = 100; // Default to 100% for sole ownership
            DateTime joinedAt = DateTime.Now;
            string coOwnerStatus = "Pending"; // Initial status
            _cms.AddContractMember(contractId, userId, sharePercentage, joinedAt, coOwnerStatus);
            return Ok("Contract and members associated with it created successfully");
        }
    }
}
