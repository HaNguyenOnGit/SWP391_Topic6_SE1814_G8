using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.Others;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using static System.IO.Directory;
using static System.IO.File;
using Microsoft.Identity.Client;

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

        //Liet ke toan bo nguoi dung co role la co-owner
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
        //Cho staff va admin xem
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
                    user.PhoneNumber
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
        // API: Xác thực email thông qua code đã gửi qua email
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
        // API: Thêm User mới
        [HttpPost("add")]
        public IActionResult AddUser([FromForm] RegisterRequest registerRequest)
        {
            //Chuoi
            string fullName = registerRequest.FullName ?? "";
            string email = registerRequest.Email ?? "";
            string citizenId = registerRequest.CitizenId ?? "";
            string driverLicenseId = registerRequest.DriverLicenseId ?? "";
            string bankName = registerRequest.BankName ?? "";
            string bankAccount = registerRequest.BankAccount ?? "";
            string role = registerRequest.Role ?? "";
            string phoneNumber = registerRequest.PhoneNumber ?? "";
            string password = registerRequest.Password ?? "";
            //4 file anh
            var frontIdImageFile = registerRequest.FrontIdImageFile;
            var backIdImageFile = registerRequest.BackIdImageFile;
            var frontLicenseImageFile = registerRequest.FrontLicenseImageFile;
            var backLicenseImageFile = registerRequest.BackLicenseImageFile;
            //Them nguoi dung
            _us.AddUser(
                fullName,
                email,
                citizenId,
                driverLicenseId,
                bankName,
                bankAccount,
                role,
                phoneNumber,
                password,
                "", // tạm thời để trống, sẽ update sau
                "",
                "",
                ""
            );
            var code = _us.GenerateEmailConfirmationCode(email);
            //Lay nguoi dung de lay id
            var user = _us.GetUserByPhone(phoneNumber);
            if (user == null)
            {
                return BadRequest("User not found after registration.");
            }
            //Den luc xu ly anh
            string rootFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "UserImages");
            string userFolder = fullName + "-" + user.UserId;
            string userPath = Path.Combine(rootFolder, userFolder);
            //Tao thu muc cho nguoi dung
            if (!Directory.Exists(userPath))
            {
                CreateDirectory(userPath);
            }
            //Luu anh vao thu muc nguoi dung và cập nhật đường dẫn
            string relativeBase = "UserImages/" + userFolder + "/";
            if (frontIdImageFile != null)
            {
                var frontIdImagePath = Path.Combine(userPath, frontIdImageFile.FileName);
                using (var stream = new FileStream(frontIdImagePath, FileMode.Create))
                {
                    frontIdImageFile.CopyTo(stream);
                }
                user.FrontIdImage = relativeBase + frontIdImageFile.FileName;
            }
            if (backIdImageFile != null)
            {
                var backIdImagePath = Path.Combine(userPath, backIdImageFile.FileName);
                using (var stream = new FileStream(backIdImagePath, FileMode.Create))
                {
                    backIdImageFile.CopyTo(stream);
                }
                user.BackIdImage = relativeBase + backIdImageFile.FileName;
            }
            if (frontLicenseImageFile != null)
            {
                var frontLicenseImagePath = Path.Combine(userPath, frontLicenseImageFile.FileName);
                using (var stream = new FileStream(frontLicenseImagePath, FileMode.Create))
                {
                    frontLicenseImageFile.CopyTo(stream);
                }
                user.FrontLicenseImage = relativeBase + frontLicenseImageFile.FileName;
            }
            if (backLicenseImageFile != null)
            {
                var backLicenseImagePath = Path.Combine(userPath, backLicenseImageFile.FileName);
                using (var stream = new FileStream(backLicenseImagePath, FileMode.Create))
                {
                    backLicenseImageFile.CopyTo(stream);
                }
                user.BackLicenseImage = relativeBase + backLicenseImageFile.FileName;
            }
            // Lưu thay đổi vào DB
            var context = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            context.Users.Update(user);
            context.SaveChanges();
            return Ok("User added successfully. Please check your email to confirm.");
        }

        // API: Kích hoạt User
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
        // API: tạo mã xác nhận mới và gửi lại email
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
