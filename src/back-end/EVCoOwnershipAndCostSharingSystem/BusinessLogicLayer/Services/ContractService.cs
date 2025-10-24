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
        public void CreateContract(string vehicleName, string licensePlate, string model, DateOnly startDate,
                                   string status)
        {
            Contract contract = new Contract
            {
                VehicleName = vehicleName,
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
        public void DeleteContract(string vehicleName, string licensePlate, string model, DateOnly startDate,
                                   string status)
        {
            Contract contract = new Contract
            {
                VehicleName = vehicleName,
                LicensePlate = licensePlate,
                Model = model,
                StartDate = startDate,
                Status = status
            };
            _cr.DeleteContract(contract);
        }

        public Contract? GetContractById(int contractId)
        {
            return _cr.GetContractById(contractId);
        }
    }
}
