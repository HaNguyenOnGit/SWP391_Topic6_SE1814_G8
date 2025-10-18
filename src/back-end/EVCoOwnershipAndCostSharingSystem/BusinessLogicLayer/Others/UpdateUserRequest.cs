using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Others
{
    public class UpdateUserRequest
    {
        public string? NewPassword { get; set; }
        public int UserId { get; set; }
    }
}
