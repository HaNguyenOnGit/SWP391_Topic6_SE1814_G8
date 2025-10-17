using DataAccessLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class ContractMemberRepository
    {
        private readonly EvcoOwnershipAndCostSharingSystemContext _context;
        public ContractMemberRepository()
        {
            _context = new EvcoOwnershipAndCostSharingSystemContext();
        }
        public void AddContractMember(ContractMember contractMember)
        {
            _context.ContractMembers.Add(contractMember);
            _context.SaveChanges();
        }
    }
}
