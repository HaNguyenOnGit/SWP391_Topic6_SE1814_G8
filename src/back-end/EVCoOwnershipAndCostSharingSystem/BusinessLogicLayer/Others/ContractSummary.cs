using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Others
{
    public class ContractSummary
    {
        public int ContractId { get; set; }
        public string Model {  get; set; }
        public string LicensePlate { get; set; }
        public DateOnly StartDate {  get; set; }
        public List<MemberSummary> MemberSummaries {  get; set; }
        public string Status { get; set; }

        public ContractSummary(int contractId, string model, string licensePlate, DateOnly startDate, List<MemberSummary> memberSummaries, string status)
        {
            ContractId = contractId;
            Model = model;
            LicensePlate = licensePlate;
            StartDate = startDate;
            MemberSummaries = memberSummaries;
            Status = status;
        }
    }
}
