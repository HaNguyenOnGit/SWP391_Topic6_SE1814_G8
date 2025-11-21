using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Entities
{
    public class UpdateMemberStatusRequest
    {
        public int ContractId { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; }
    }
}
