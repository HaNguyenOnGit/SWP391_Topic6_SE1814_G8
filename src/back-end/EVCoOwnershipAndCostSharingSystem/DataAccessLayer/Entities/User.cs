using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string? Email { get; set; }

    public string CitizenId { get; set; } = null!;

    public string DriverLicenseId { get; set; } = null!;

    public string? BankName { get; set; }

    public string? BankAccount { get; set; }

    public string Role { get; set; } = null!;

    public string Status { get; set; } = null!;

    public bool IsEmailConfirmed { get; set; }

    public string? EmailConfirmationCode { get; set; }

    public DateTime? EmailConfirmationExpiry { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Password { get; set; }

    public string? FrontIdImage { get; set; }

    public string? BackIdImage { get; set; }

    public string? FrontLicenseImage { get; set; }

    public string? BackLicenseImage { get; set; }

    public virtual ICollection<ContractMember> ContractMembers { get; set; } = new List<ContractMember>();

    public virtual ICollection<ExpenseAllocation> ExpenseAllocations { get; set; } = new List<ExpenseAllocation>();

    public virtual ICollection<ExpenseProposal> ExpenseProposals { get; set; } = new List<ExpenseProposal>();

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<ProposalVote> ProposalVotes { get; set; } = new List<ProposalVote>();

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    public virtual ICollection<Settlement> SettlementPayers { get; set; } = new List<Settlement>();

    public virtual ICollection<Settlement> SettlementReceivers { get; set; } = new List<Settlement>();

    public virtual ICollection<UsageLog> UsageLogUsers { get; set; } = new List<UsageLog>();

}
