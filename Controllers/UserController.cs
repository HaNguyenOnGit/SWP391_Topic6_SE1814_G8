using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.Others;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly UserService _us;
        private readonly EmailService _emailService;

        // Inject cả UserService và EmailService
        public UserController(UserService us, EmailService emailService)
        {
            _us = us;
            _emailService = emailService;
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

        [HttpPost("confirm-email")]
        public IActionResult ConfirmEmail([FromQuery] string email, [FromQuery] string code)
        {
            try
            {
                _us.ConfirmEmail(email, code);
                return Ok("Email confirmed successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
                user.Password
            );

            // Gửi mã xác nhận luôn
            var code = _us.GenerateEmailConfirmationCode(user.Email);

            return Ok("User added successfully. Please check your email to confirm.");
        }

        [HttpPost("generate-code")]
        public IActionResult GenerateCode([FromQuery] string email)
        {
            try
            {
                var code = _us.GenerateEmailConfirmationCode(email);
                return Ok(new { Email = email, Message = "Code sent to email" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}



