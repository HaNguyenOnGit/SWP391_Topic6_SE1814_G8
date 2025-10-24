using DataAccessLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class UsageLogRepository
    {
        private readonly EvcoOwnershipAndCostSharingSystemContext _context;
        public UsageLogRepository()
        {
            _context = new EvcoOwnershipAndCostSharingSystemContext();
        }
        public void AddUsageLog(UsageLog usageLog)
        {
            _context.UsageLogs.Add(usageLog);
            _context.SaveChanges();
        }
    }
}
