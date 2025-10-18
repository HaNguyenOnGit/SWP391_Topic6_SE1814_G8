using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class ContractMember
{
    public int ContractId { get; set; }

    public int UserId { get; set; }

    public decimal SharePercent { get; set; }

    public DateTime? JoinedAt { get; set; }

    public string Status { get; set; } = null!;

    public virtual Contract Contract { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
