using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;
using MailKit;
using Microsoft.AspNetCore.Mvc;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly UserService _us;

        public UserController()
        {
            _us = new UserService();
        }

        [HttpGet("{fullName}/{password}")]
        public ActionResult<User> GetUser([FromRoute] string fullName, [FromRoute] string password)
        {
            var user = _us.GetUser(fullName, password);
            if (user == null)
            {
                return NotFound("User not found");
            }
            return Ok(user);
        }

        [HttpPost]
        public IActionResult AddUser([FromBody] User user)
        {
            _us.AddUser(
                user.FullName,
                user.Email,
                user.CitizenId,
                user.DriverLicenseId,
                user.BankName,
                user.BankAccount,
                user.Role,
                user.PhoneNumber,
                user.Password,
                user.FrontIdImage,
                user.BackIdImage,
                user.FrontLicenseImage,
                user.BackLicenseImage
            );
            return Ok("User added successfully");
        }
    }
}

    

    
