using BusinessLogicLayer.Others;
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

        [HttpPost("login")]
        public ActionResult<User> GetUser([FromBody] LoginRequest request)
        {
            string fullName = request.FullName;
            string password = request.Password;
            var user = _us.GetUser(fullName, password);
            if (user == null)
            {
                return NotFound("User not found");
            }
            return Ok(user);
        }

        [HttpPost("add")]
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

    

    
