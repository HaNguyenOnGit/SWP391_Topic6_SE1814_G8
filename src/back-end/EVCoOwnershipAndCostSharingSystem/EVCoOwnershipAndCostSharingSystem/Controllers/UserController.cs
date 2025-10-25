using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.Others;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly UserService _us;
        private readonly EmailService _emailService;
        private readonly AuthService _authService;

        // Inject cả UserService và EmailService
        public UserController(UserService us, EmailService emailService, AuthService authService)
        {
            _us = us;
            _emailService = emailService;
            _authService = authService;
        }

        //Liet ke nguoi dung co role la co-owner
        //Chi hien thi ten, so dien thoai, email, role, status
        //Cho staff va admin xem
        [HttpGet("userSummary")]
        public ActionResult<List<UserSummary>> GetUserSummaries()
        {
            var userList = _us.GetAllUsers();
            List<UserSummary> summaries = new List<UserSummary>();
            foreach (var user in userList)
            {
                UserSummary summary = new UserSummary
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber,
                    Email = user.Email,
                    Role = user.Role,
                    Status = user.Status
                };
                summaries.Add(summary);
            }
            return Ok(summaries);
        }

        //Hien thi tat ca thong tin cua 1 nguoi dung 
        [HttpGet("userDetail/{userId}")]
        public ActionResult<User> GetUserById([FromRoute] int userId)
        {
            var user = _us.GetUserById(userId);
            if (user == null)
            {
                return NotFound($"User with ID {userId} not found");
            }
            UserDetail ud = new UserDetail
            {
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                CitizenId = user.CitizenId,
                DriverLicenseId = user.DriverLicenseId,
                BankName = user.BankName,
                BankAccount = user.BankAccount,
                Role = user.Role,
                Status = user.Status,
                FrontIdImage = user.FrontIdImage,
                BackIdImage = user.BackIdImage,
                FrontLicenseImage = user.FrontLicenseImage,
                BackLicenseImage = user.BackLicenseImage
            };
            return Ok(ud);
        }

        // Lấy tất cả người dùng
        // Dung trong dang ky nguoi dung moi
        // De phong truong hop trung so dien thoai
        [HttpGet("all")]
        public ActionResult<List<User>> GetAllUsers()
        {
            var userList = _us.GetAllUsers();
            return Ok(userList);
        }

        //Dang nhap
        [HttpPost("login")]
        public ActionResult GetUser([FromBody] LoginRequest request)
        {
            string phoneNumber = request.PhoneNumber;
            string password = request.Password;
            var user = _us.GetUser(phoneNumber, password);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Generate JWT token
            var token = _authService.GenerateJwtToken(user);

            // Return token and minimal user info (no password)
            return Ok(new
            {
                Token = token,
                User = new
                {
                    user.UserId,
                    user.FullName,
                    user.Role,
                    user.Status,
                }
            });
        }

        //API nay chi dung de kiem tra so dien thoai da duoc dang ky chua
        //Dung trong viec them thanh vien vao hop dong
        [HttpGet("phone/{phoneNumber}")]
        public ActionResult<User> GetUserByPhone(string phoneNumber)
        {
            var user = _us.GetUserByPhone(phoneNumber);
            if (user == null)
            {
                return NotFound($"User with phone number {phoneNumber} not found");
            }
            return Ok(user.FullName);
        }

        //Cap nhat mat khau
        [HttpPut("updateUserRequest")]
        public IActionResult UpdateUser([FromBody] UpdateUserRequest uur)
        {
            int userId = uur.UserId;
            string newPassword = uur.NewPassword;
            if (string.IsNullOrEmpty(newPassword))
            {
                return BadRequest("Password must not empty.");
            }
            _us.UpdateUser(newPassword, userId);
            return Ok("User updated successfully");
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

            // Gửi mã xác nhận luôn
            var code = _us.GenerateEmailConfirmationCode(user.Email);

            return Ok("User added successfully. Please check your email to confirm.");
        }

        // Enable user account by ID
        [HttpPut("{userId}/enable")]
        public IActionResult EnableUser(int userId)
        {
            try
            {
                _us.EnableUserById(userId);
                return Ok(new { UserId = userId, Status = "Enabled" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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

        // Lấy thông tin người dùng hiện tại từ JWT
        [HttpGet("me")]
        [Authorize]
        public ActionResult GetMe()
        {
            // Lấy phone từ claim unique_name (hoặc ClaimTypes.Name)
            var userClaims = HttpContext.User;
            var phone = userClaims?.FindFirst(JwtRegisteredClaimNames.UniqueName)?.Value
                        ?? userClaims?.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(phone))
            {
                return Unauthorized("Invalid token");
            }

            var user = _us.GetUserByPhone(phone);
            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(new
            {
                User = new
                {
                    user.UserId,
                    user.FullName,
                    user.Email,
                    user.CitizenId,
                    user.DriverLicenseId,
                    user.BankName,
                    user.BankAccount,
                    user.Role,
                    user.IsEmailConfirmed,
                    user.PhoneNumber,
                    user.Status,
                }
            });
        }
    }
}



