using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class Reservation
{
    public int ReservationId { get; set; }

    public int ContractId { get; set; }

    public int UserId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Contract Contract { get; set; } = null!;


    public virtual User User { get; set; } = null!;
}
