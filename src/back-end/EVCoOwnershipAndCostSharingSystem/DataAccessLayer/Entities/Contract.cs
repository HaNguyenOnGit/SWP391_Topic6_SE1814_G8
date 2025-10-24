using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class Contract
{
    public int ContractId { get; set; }

    public string LicensePlate { get; set; } = null!;

    public string? Model { get; set; }

    public DateOnly StartDate { get; set; }

    public string Status { get; set; } = null!;

    public string? VehicleName { get; set; }

    public virtual ICollection<ContractMember> ContractMembers { get; set; } = new List<ContractMember>();

    public virtual ICollection<ExpenseProposal> ExpenseProposals { get; set; } = new List<ExpenseProposal>();

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    public virtual ICollection<UsageLog> UsageLogs { get; set; } = new List<UsageLog>();
}
