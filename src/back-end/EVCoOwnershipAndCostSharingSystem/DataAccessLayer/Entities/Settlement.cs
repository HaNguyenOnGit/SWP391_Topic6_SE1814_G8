using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class Settlement
{
    public int SettlementId { get; set; }

    public int AllocationId { get; set; }

    public int PayerId { get; set; }

    public int ReceiverId { get; set; }

    public decimal Amount { get; set; }

    public DateTime? PaymentDate { get; set; }

    public string Method { get; set; } = null!;

    public string? Reference { get; set; }

    public string? Status { get; set; }         // Pending, Completed, Rejected...

    public string? ProofImageUrl { get; set; }

    public virtual ExpenseAllocation Allocation { get; set; } = null!;

    public virtual User Payer { get; set; } = null!;

    public virtual User Receiver { get; set; } = null!;
}
