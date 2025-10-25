using DataAccessLayer.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DataAccessLayer.Repositories
{
    public class SettlementRepository
    {
        private readonly EvcoOwnershipAndCostSharingSystemContext _context;

        public SettlementRepository()
        {
            _context = new EvcoOwnershipAndCostSharingSystemContext();
        }

        // Lấy danh sách settlement theo ContractId
        public List<Settlement> GetByContract(int contractId)
        {
            return _context.Settlements
                .Include(s => s.Allocation)
                .ThenInclude(a => a.Expense)
                .Where(s => s.Allocation.Expense.ContractId == contractId)
                .ToList();
        }

        // Lấy 1 settlement theo Id
        public Settlement? GetById(int settlementId)
        {
            return _context.Settlements
                .FirstOrDefault(s => s.SettlementId == settlementId);
        }

        // Cập nhật trạng thái
        public void UpdateStatus(int settlementId, string newStatus)
        {
            var s = _context.Settlements.FirstOrDefault(x => x.SettlementId == settlementId);
            if (s == null)
                throw new Exception("Settlement not found");

            s.Status = newStatus;
            _context.Settlements.Update(s);
            _context.SaveChanges();
        }

        // Cập nhật ảnh chứng minh thanh toán
        public void UpdateProofImage(int settlementId, string proofImageUrl)
        {
            var s = _context.Settlements.FirstOrDefault(x => x.SettlementId == settlementId);
            if (s == null)
                throw new Exception("Settlement not found");

            s.ProofImageUrl = proofImageUrl;
            _context.Settlements.Update(s);
            _context.SaveChanges();
        }

        // Thêm settlement mới
        public void AddSettlement(Settlement settlement)
        {
            _context.Settlements.Add(settlement);
            _context.SaveChanges();
        }

        // Lấy tất cả settlement
        public List<Settlement> GetAll()
        {
            return _context.Settlements.ToList();
        }

        // Xóa settlement (nếu cần)
        public void DeleteSettlement(int settlementId)
        {
            var s = GetById(settlementId);
            if (s == null)
                throw new Exception("Settlement not found");

            _context.Settlements.Remove(s);
            _context.SaveChanges();
        }
    }
}
