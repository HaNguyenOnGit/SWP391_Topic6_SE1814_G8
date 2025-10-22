using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Others
{
    public class UsageLogRequest
    {
        public int ContractId { get; set; }

        public int UserId { get; set; }

        public int OdometerStart { get; set; }

        public int OdometerEnd { get; set; }

        public DateTime CheckOutTime { get; set; }

        public DateTime CheckInTime { get; set; }

        public string? ProofImageStart { get; set; }

        public string? ProofImageEnd { get; set; }
    }
}
