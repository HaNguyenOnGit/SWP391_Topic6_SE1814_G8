using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Others
{
    public class ProposalAllocationDto
    {
        public int UserId { get; set; }
        public decimal Percent { get; set; } // hoặc Amount
    }
}
