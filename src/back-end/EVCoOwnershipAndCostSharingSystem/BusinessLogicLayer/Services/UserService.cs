using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using System;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Mail;

namespace BusinessLogicLayer.Services
{
    public class UserService
    {
        private readonly UserRepository _ur;

        // ✅ Gmail hệ thống duy nhất
        private const string systemEmail = "phuhung258@gmail.com";
        private const string systemAppPassword = "zrsw mewp lawc osxa";

        public UserService()
        {
            _ur = new UserRepository();
        }

        public List<User> GetAllUsers()
        {
            return _ur.GetAllUsers();
        }

        public User GetUser(string phoneNumber, string email)
        {
            return _ur.GetUser(phoneNumber, email);
        }

        public User? GetUserByEmail(string email)
        {
            return _ur.GetUserByEmail(email);
        }

        public User? GetUserByPhone(string phoneNumber)
        {
            return _ur.GetUserByPhone(phoneNumber);
        }

        public User? GetUserById(int userId)
        {
            return _ur.GetUserById(userId);
        }

        public void AddUser(string fullName, string email, string citizenId, string drivingLicenseId,
                            string bankName, string bankAccount, string role,
                            string phoneNumber, string password, string frontIdImage, string backIdImage, string frontLicenseImage, string backLicenseImage)
        {
            // ✅ Validate Gmail format
            if (!new EmailAddressAttribute().IsValid(email) ||
                !email.EndsWith("@gmail.com", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Chỉ hỗ trợ đăng ký bằng Gmail hợp lệ!");

            User user = new User
            {
                FullName = fullName,
                Email = email,
                CitizenId = citizenId,
                DriverLicenseId = drivingLicenseId,
                BankName = bankName,
                BankAccount = bankAccount,
                Role = role,
                Status = "Disabled",
                IsEmailConfirmed = false,
                EmailConfirmationCode = null,
                EmailConfirmationExpiry = null,
                PhoneNumber = phoneNumber,
                Password = password,
                FrontIdImage = frontIdImage,
                BackIdImage = backIdImage,
                FrontLicenseImage = frontLicenseImage,
                BackLicenseImage = backLicenseImage
            };

            _ur.AddUser(user);
        }

        public void UpdateUser(User user)
        {
            _ur.UpdateUser(user);
        }

        public void UpdateUser(string newPassword, int userId)
        {
            _ur.UpdateUser(newPassword,userId);
        }

        // Gửi mã xác nhận
        public string GenerateEmailConfirmationCode(string email)
        {
            var user = _ur.GetUserByEmail(email);
            if (user == null)
                throw new Exception("Email chưa tồn tại trong hệ thống");

            // code random
            string code = new Random().Next(100000, 999999).ToString();

            user.EmailConfirmationCode = code;
            user.EmailConfirmationExpiry = DateTime.Now.AddMinutes(10);
            _ur.UpdateUser(user);

            // Gửi email
            SendConfirmationEmail(email, code);

            return code;
        }

        private void SendConfirmationEmail(string toEmail, string confirmationCode)
        {
            using (var client = new SmtpClient("smtp.gmail.com", 587))
            {
                client.Credentials = new NetworkCredential(systemEmail, systemAppPassword);
                client.EnableSsl = true;

                var mail = new MailMessage();
                mail.From = new MailAddress(systemEmail, "EVCO System");
                mail.To.Add(toEmail);
                mail.Subject = "Mã xác nhận đăng ký";
                mail.Body = $"Mã xác nhận của bạn là: {confirmationCode} (hết hạn sau 10 phút).";

                client.Send(mail);
            }
        }

        // Xác nhận email
        public void ConfirmEmail(string email, string code)
        {
            var user = _ur.GetUserByEmail(email);

            if (user == null)
                throw new Exception("User not found");

            if (user.IsEmailConfirmed == true)
                throw new Exception("Email already confirmed");

            if (user.EmailConfirmationCode != code)
                throw new Exception("Invalid confirmation code");

            if (user.EmailConfirmationExpiry < DateTime.Now)
                throw new Exception("Confirmation code expired");

            // Nếu đúng code thì xác nhận email
            user.IsEmailConfirmed = true;
            user.EmailConfirmationCode = null;
            user.EmailConfirmationExpiry = null;

            _ur.UpdateUser(user);
        }

        public void EnableUserById(int userId)
        {
            var user = _ur.GetUserById(userId);
            if (user == null)
                throw new Exception("User not found");
            user.Status = "Enabled";
            _ur.UpdateUser(user);
        }
        
    }
}
