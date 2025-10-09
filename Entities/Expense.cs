using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class Expense
{
    public int ExpenseId { get; set; }

    public int ContractId { get; set; }

    public int? ProposalId { get; set; }

    public string Type { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Amount { get; set; }

    public DateOnly ExpenseDate { get; set; }

    public int? CreatedBy { get; set; }

    public string AllocationRule { get; set; } = null!;

    public string? ReceiptFile { get; set; }

    public virtual Contract Contract { get; set; } = null!;

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<ExpenseAllocation> ExpenseAllocations { get; set; } = new List<ExpenseAllocation>();

    public virtual ExpenseProposal? Proposal { get; set; }
}
