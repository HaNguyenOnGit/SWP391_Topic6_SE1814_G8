using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services
{
    public class UserService
    {
        private readonly UserRepository _ur;

        public UserService()
        {
            _ur = new UserRepository();
        }
        public User GetUser(string fullName, string password)
        {
            return _ur.GetUser(fullName, password);
        }
        public void AddUser(string fullName, string email, string citizenId, string drivingLicenseId, string bankName, string bankAccount, string role,
                            string phoneNumber, string password, string frontIdImage, string backIdImage, string frontLicenseImage, string backLicenseImage)
        {
            User user = new User
            {
                FullName = fullName,
                Email = email,
                CitizenId = citizenId,
                DriverLicenseId = drivingLicenseId,
                BankName = bankName,
                BankAccount = bankAccount,
                Role = role,
                PhoneNumber = phoneNumber,
                Password = password,
                FrontIdImage = frontIdImage,
                BackIdImage = backIdImage,
                FrontLicenseImage = frontLicenseImage,
                BackLicenseImage = backLicenseImage
            };
            _ur.AddUser(user);
        }
        public User? GetUserByEmail(string email)
        {
            return _ur.GetUserByEmail(email);
        }
    }
}
