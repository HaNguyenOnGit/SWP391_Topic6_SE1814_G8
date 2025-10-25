using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Others
{
    public class CreateProposalRequest
    {
        public int ContractId { get; set; }
        public int ProposedBy { get; set; }
        public string Description { get; set; }
        public decimal ExpectedAmount { get; set; }
        public string AllocationRule { get; set; }
        public List<ProposalAllocationDto>? Allocations { get; set; }
    }
}
