using DataAccessLayer.Entities;
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
    }
}
