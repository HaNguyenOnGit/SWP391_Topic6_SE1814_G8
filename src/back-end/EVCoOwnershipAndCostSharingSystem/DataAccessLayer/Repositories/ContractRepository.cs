using DataAccessLayer.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class ContractRepository
    {
        private readonly EvcoOwnershipAndCostSharingSystemContext _context;

        public ContractRepository()
        {
            _context = new EvcoOwnershipAndCostSharingSystemContext();
        }
        public void AddContract(Contract contract)
        {
            _context.Contracts.Add(contract);
            _context.SaveChanges();
        }
        public Contract? GetContractByPlate(string licensePlate)
        {
            return _context.Contracts.FirstOrDefault(c => c.LicensePlate == licensePlate);
        }
        public void DeleteContract(Contract contract)
        {
            _context.Contracts.Remove(contract);
            _context.SaveChanges();
        }

        public Contract? GetContractById(int contractId)
        {
            return _context.Contracts
                .Where(c => c.ContractId == contractId)
                .Include(c => c.ContractMembers)
                .ThenInclude(cm => cm.User)
                .FirstOrDefault();
        }
    }
}
