using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services
{
    public class ContractMemberService
    {
        private readonly ContractMemberRepository _cmr;

        public ContractMemberService()
        {
            _cmr = new ContractMemberRepository();
        }

        public void AddContractMember(int contractId, int userId, decimal sharePercent, DateTime joinedAt, string status) 
        {
            ContractMember contractMember = new ContractMember
            {
                ContractId = contractId,
                UserId = userId,
                SharePercent = sharePercent,
                JoinedAt = joinedAt,
                Status = status
            };
            _cmr.AddContractMember(contractMember);
        }

        public int GetContractIdByMemberName(string fullName)
        {
            return _cmr.GetContractIdByMemberName(fullName);
        }

        public List<ContractMember> GetCoOwnerList(int contractId)
        {
            return _cmr.GetCoOwnerList(contractId);
        }
    }
}
