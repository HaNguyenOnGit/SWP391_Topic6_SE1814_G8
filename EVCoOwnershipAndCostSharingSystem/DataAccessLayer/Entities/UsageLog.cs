using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class UsageLog
{
    public int UsageId { get; set; }

    public int ContractId { get; set; }

    public int UserId { get; set; }

    public int OdometerStart { get; set; }

    public int OdometerEnd { get; set; }

    public DateTime CheckOutTime { get; set; }

    public DateTime CheckInTime { get; set; }

    public int Distance { get; set; }

    public string? ProofImageStart { get; set; }

    public string? ProofImageEnd { get; set; }

    public virtual Contract Contract { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
