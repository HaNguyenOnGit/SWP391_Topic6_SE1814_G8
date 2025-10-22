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

        public List<ContractMember> GetCoOwnerList(int contractId)
        {
            return _context.ContractMembers
                .Where(cm => cm.ContractId == contractId)
                .ToList();
        }

        public int GetContractIdByMemberName(string fullName)
        {
            //Lay id truoc do mọi thu deu dung id
            var user = _context.Users.FirstOrDefault(u => u.FullName == fullName);
            int userId = user != null ? user.UserId : -1;
            var contractMember = _context.ContractMembers.FirstOrDefault(cm => cm.UserId == userId);
            int contractId = contractMember != null ? contractMember.ContractId : -1;
            return contractId;
        }
    }
}
