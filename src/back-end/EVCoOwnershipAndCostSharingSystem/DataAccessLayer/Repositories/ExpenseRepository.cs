using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Entities;

namespace DataAccessLayer.Repositories
{
    public class ExpenseRepository
    {
        private readonly EvcoOwnershipAndCostSharingSystemContext _db;
        public ExpenseRepository()
        {
            _db = new EvcoOwnershipAndCostSharingSystemContext();
        }

        public IEnumerable<Expense> GetByContract(int contractId)
        {
            return _db.Expenses
                      .Where(e => e.ContractId == contractId)
                      .ToList();
        }

        public Expense GetExpenseWithAllocations(int expenseId)
        {
            return _db.Expenses
                      .Where(e => e.ExpenseId == expenseId)
                      .Select(e => e)
                      .FirstOrDefault(); // make sure navigation properties are configured for lazy/eager loading
        }

        public IEnumerable<ExpenseAllocation> GetAllocationsByExpense(int expenseId)
        {
            return _db.ExpenseAllocations.Where(a => a.ExpenseId == expenseId).ToList();
        }

        public IEnumerable<Expense> GetUserExpenseHistory(int userId, int contractId)
        {
            // Return expenses in contract where there is an allocation for this user
            return _db.Expenses
                      .Where(e => e.ContractId == contractId && e.ExpenseAllocations.Any(a => a.UserId == userId))
                      .ToList();
        }

        public void AddSettlement(Settlement s)
        {
            _db.Settlements.Add(s);
            _db.SaveChanges();
        }

        public void UpdateAllocation(ExpenseAllocation a)
        {
            _db.ExpenseAllocations.Update(a);
            _db.SaveChanges();
        }

        public ExpenseAllocation GetAllocationById(int allocationId)
        {
            return _db.ExpenseAllocations.FirstOrDefault(x => x.AllocationId == allocationId);
        }

        public void UpdateExpense(Expense e)
        {
            _db.Expenses.Update(e);
            _db.SaveChanges();
        }

        // add other helpers (create expense, allocations...) as needed
    }
}
