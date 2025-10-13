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
    public class ContractService
    {
        private readonly ContractRepository _cr;
        public ContractService()
        {
            _cr = new ContractRepository();
        }
        public void CreateContract(string licensePlate, string model, DateOnly startDate,
                                   string status)
        {
            Contract contract = new Contract
            {
                LicensePlate = licensePlate,
                Model = model,
                StartDate = startDate,
                Status = status
            };
            _cr.AddContract(contract);
        }
        public Contract? GetContractByPlate(string licensePlate)
        {
            return _cr.GetContractByPlate(licensePlate);
        }
    }
}
