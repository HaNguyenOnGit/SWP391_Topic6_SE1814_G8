using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace BusinessLogicLayer.Others
{
    public class RegisterRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? CitizenId { get; set; }
        public string? DriverLicenseId { get; set; }
        public string? BankName { get; set; }
        public string? BankAccount { get; set; }
        public string? Role { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Password { get; set; }

        public IFormFile? FrontIdImageFile { get; set; }
        public IFormFile? BackIdImageFile { get; set; }
        public IFormFile? FrontLicenseImageFile { get; set; }
        public IFormFile? BackLicenseImageFile { get; set; }
    }
}
