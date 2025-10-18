using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class ProposalVote
{
    public int ProposalId { get; set; }

    public int UserId { get; set; }

    public string Vote { get; set; } = null!;

    public DateTime? VotedAt { get; set; }

    public virtual ExpenseProposal Proposal { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
