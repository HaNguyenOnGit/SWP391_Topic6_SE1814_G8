using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class ExpenseAllocation
{
    public int AllocationId { get; set; }

    public int ExpenseId { get; set; }

    public int UserId { get; set; }

    public decimal Amount { get; set; }

    public string Status { get; set; } = null!;

    public virtual Expense Expense { get; set; } = null!;

    public virtual ICollection<Settlement> Settlements { get; set; } = new List<Settlement>();

    public virtual User User { get; set; } = null!;
}
