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


        public bool UpdateMemberStatus(int contractId, int userId, string status)
        {
            var member = _context.ContractMembers.FirstOrDefault(cm => cm.ContractId == contractId && cm.UserId == userId);
            if (member == null) return false;
            member.Status = status;
            _context.SaveChanges();
            return true;
        }
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

        public void DeleteContractMember(int contractId, int userId)
        {
            var member = _context.ContractMembers.FirstOrDefault(cm => cm.ContractId == contractId && cm.UserId == userId);
            if (member != null)
            {
                _context.ContractMembers.Remove(member);
                _context.SaveChanges();
            }
        }

        public List<ContractMember> GetContractMembersByContractId(int contractId)
        {
            return _context.ContractMembers
                .Where(cm => cm.ContractId == contractId)
                .ToList();
        }

        public List<int> GetContractIdsByUserId(int userId)
        {
            return _context.ContractMembers
                .Where(cm => cm.UserId == userId)
                .Select(cm => cm.ContractId)
                .Distinct()
                .ToList();
        }
    }
}
