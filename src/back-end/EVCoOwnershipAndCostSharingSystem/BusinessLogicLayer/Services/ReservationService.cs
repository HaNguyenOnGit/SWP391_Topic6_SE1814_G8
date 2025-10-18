using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.Services
{
    public class ReservationService
    {
        private readonly ReservationRepository _reservationRepo;

        public ReservationService()
        {
            _reservationRepo = new ReservationRepository();
        }

        public Reservation CreateReservation(int contractId, int userId, DateTime startTime, DateTime endTime)
        {
            if (endTime <= startTime)
                throw new Exception("Thời gian kết thúc phải sau thời gian bắt đầu.");

            // kiểm tra trùng lịch
            if (!_reservationRepo.IsTimeSlotAvailable(contractId, startTime, endTime))
                throw new Exception("Khung giờ này đã có người đặt. Vui lòng chọn thời gian khác.");

            var reservation = new Reservation
            {
                ContractId = contractId,
                UserId = userId,
                StartTime = startTime,
                EndTime = endTime,
                Status = "Pending",  
                CreatedAt = DateTime.Now
            };

            _reservationRepo.AddReservation(reservation);
            return reservation;
        }

        public List<Reservation> GetReservationsByContractAndDate(int contractId, DateTime date)
        {
            return _reservationRepo.GetReservationsByContractAndDate(contractId, date);
        }
        public void UpdateReservationStatus(int reservationId, string newStatus)
        {
            var reservation = _reservationRepo.GetReservationById(reservationId);
            if (reservation == null)
                throw new Exception("Không tìm thấy đặt lịch.");

            if (string.IsNullOrEmpty(newStatus))
                throw new ArgumentException("Trạng thái không hợp lệ.");

            // chỉ cho phép Approved / Rejected / Cancelled
            var allowedStatuses = new[] { "Approved", "Rejected", "Cancelled" };
            if (!allowedStatuses.Contains(newStatus))
                throw new ArgumentException("Trạng thái không hợp lệ. Chỉ chấp nhận: Approved, Rejected, Cancelled.");

            reservation.Status = newStatus;
            _reservationRepo.UpdateReservation(reservation);
        }
    }
}
