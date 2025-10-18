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

        public List<Reservation> GetReservationsByContractAndDate(int contractId, DateTime date)
        {
            return _context.Reservations
                .Where(r => r.ContractId == contractId &&
                            r.StartTime.Date == date.Date)
                .ToList();
        }
    }
}
