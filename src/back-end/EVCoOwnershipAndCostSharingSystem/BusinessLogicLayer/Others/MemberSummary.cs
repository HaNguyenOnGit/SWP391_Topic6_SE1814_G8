using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Others
{
    public class MemberSummary
    {
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public decimal SharePercent { get; set; }

        public MemberSummary(string fullName, string phoneNumber, decimal sharePercent) {           
            FullName = fullName;
            PhoneNumber = phoneNumber;
            SharePercent = sharePercent;
        }
    }
}
