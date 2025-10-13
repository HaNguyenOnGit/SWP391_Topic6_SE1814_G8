using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Others
{
    public class ContractRequest 
    {
        public string VehicleName { get; set; } 
        public string LicensePlate { get; set; } 
        public string Model { get; set; }
        public DateOnly StartDate { get; set; } 
        public string Status { get; set; }
        public List<MemberRequest> Members { get; set; } = new List<MemberRequest>();
    }
}
