
using DataAccessLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DataAccessLayer.Repositories
{
    public class ReservationRepository
    {
        private readonly EvcoOwnershipAndCostSharingSystemContext _context;

        public ReservationRepository()
        {
            _context = new EvcoOwnershipAndCostSharingSystemContext();
        }


        public bool DeleteReservation(int reservationId)
        {
            var reservation = _context.Reservations.FirstOrDefault(r => r.ReservationId == reservationId);
            if (reservation == null) return false;
            _context.Reservations.Remove(reservation);
            _context.SaveChanges();
            return true;
        }

        public void AddReservation(Reservation reservation)
        {
            _context.Reservations.Add(reservation);
            _context.SaveChanges();
        }

        public Reservation? GetReservationById(int id)
        {
            return _context.Reservations.FirstOrDefault(r => r.ReservationId == id);
        }

        public void UpdateReservation(Reservation reservation)
        {
            _context.Reservations.Update(reservation);
            _context.SaveChanges();
        }

        public bool IsTimeSlotAvailable(int contractId, DateTime startTime, DateTime endTime)
        {
            return !_context.Reservations.Any(r =>
                r.ContractId == contractId &&
                ((startTime >= r.StartTime && startTime < r.EndTime) ||
                 (endTime > r.StartTime && endTime <= r.EndTime) ||
                 (startTime <= r.StartTime && endTime >= r.EndTime)));
        }

        public void DeleteReservation(int contractId, DateTime startTime)
        {
            var reservation = _context.Reservations
                .FirstOrDefault(r => r.ContractId == contractId && r.StartTime == startTime);

            if (reservation == null)
                throw new Exception("Không tìm thấy lịch đặt để xóa.");

            _context.Reservations.Remove(reservation);
            _context.SaveChanges();
        }

        // Lấy danh sách lịch theo tháng
        public List<Reservation> GetReservationsByContractAndMonth(int contractId, int month, int year)
        {
            return _context.Reservations
                .Where(r => r.ContractId == contractId && r.StartTime.Month == month && r.StartTime.Year == year)
                .Select(r => new Reservation
                {
                    ReservationId = r.ReservationId,
                    ContractId = r.ContractId,
                    UserId = r.UserId,
                    StartTime = r.StartTime,
                    EndTime = r.EndTime,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt,
                    User = r.User
                })
                .ToList();
        }
    }
}
