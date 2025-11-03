using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services
{
    public class UsageLogService
    {
        private readonly UsageLogRepository _ulr;
        public UsageLogService()
        {
            _ulr = new UsageLogRepository();
        }
        public void AddUsageLog(int contractId, int userId, int odometerStart, int odometerEnd,
                                DateTime checkOutTime, DateTime checkInTime, 
                                int distance, string proofImageStart, string proofImageEnd)
        {
            var usageLog = new UsageLog
            {
                ContractId = contractId,
                UserId = userId,
                OdometerStart = odometerStart,
                OdometerEnd = odometerEnd,
                CheckOutTime = checkOutTime,
                CheckInTime = checkInTime,
                Distance = distance,
                ProofImageStart = proofImageStart,
                ProofImageEnd = proofImageEnd
            };
            _ulr.AddUsageLog(usageLog);
        }
        public void DeleteUsageLogsByContractId(int contractId)
        {
            _ulr.DeleteUsageLogsByContractId(contractId);
        }
    }
}
