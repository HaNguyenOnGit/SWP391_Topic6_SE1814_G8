using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Others
{
    public class PaymentRequest
    {
        public int AllocationId { get; set; }
        public int PayerId { get; set; }
        public string Method { get; set; } = null!;
        public string? Reference { get; set; }
    }
}
