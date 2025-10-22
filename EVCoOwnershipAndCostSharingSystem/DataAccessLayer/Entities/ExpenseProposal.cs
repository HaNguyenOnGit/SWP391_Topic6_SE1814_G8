using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class ExpenseProposal
{
    public int ProposalId { get; set; }

    public int ContractId { get; set; }

    public int ProposedBy { get; set; }

    public string? Description { get; set; }

    public decimal? ExpectedAmount { get; set; }

    public string AllocationRule { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Contract Contract { get; set; } = null!;

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<ProposalVote> ProposalVotes { get; set; } = new List<ProposalVote>();

    public virtual User ProposedByNavigation { get; set; } = null!;
}
