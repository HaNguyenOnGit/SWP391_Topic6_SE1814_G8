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
                                   string status, int creator)
        {
            Contract contract = new Contract
            {
                VehicleName = vehicleName,
                LicensePlate = licensePlate,
                Model = model,
                StartDate = startDate,
                Status = status,
                Creator = creator
            };
            _cr.AddContract(contract);
        }

        public Contract? GetContractById(int userId)
        {
            return _cr.GetContractById(userId);
        }

        public Contract? GetContractByPlate(string licensePlate)
        {
            return _cr.GetContractByPlate(licensePlate);
        }

        public int GetContractId(int userId)
        {
            return _cr.GetContractId(userId);
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
    }
}
