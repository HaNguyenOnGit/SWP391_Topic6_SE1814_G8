using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using System;
using System.Collections.Generic;
using System.Globalization;

namespace BusinessLogicLayer.Services
{
    public class ReservationService
    {
        private readonly ReservationRepository _reservationRepo;

        public ReservationService()
        {
            _reservationRepo = new ReservationRepository();
        }

        // ✅ Thêm mới (vẫn giữ như cũ)
        public Reservation CreateReservation(int contractId, int userId, DateTime startTime, DateTime endTime)
        {
            if (endTime <= startTime)
                throw new Exception("Thời gian kết thúc phải sau thời gian bắt đầu.");

            if (!_reservationRepo.IsTimeSlotAvailable(contractId, startTime, endTime))
                throw new Exception("Khung giờ này đã có người đặt.");

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

        // ✅ Lấy danh sách lịch theo ngày (format linh hoạt)
        public List<Reservation> GetReservationsByContractAndDate(int contractId, string dateString)
        {
            if (!DateTime.TryParse(dateString, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                throw new Exception("Định dạng ngày không hợp lệ.");

            return _reservationRepo.GetReservationsByContractAndDate(contractId, date);
        }

        // ✅ Xóa lịch (contractId + datetime)
        public void DeleteReservation(int contractId, string dateTimeString)
        {
            if (!DateTime.TryParse(dateTimeString, CultureInfo.InvariantCulture, DateTimeStyles.None, out var startTime))
                throw new Exception("Định dạng thời gian không hợp lệ.");

            _reservationRepo.DeleteReservation(contractId, startTime);
        }

        public void UpdateReservationStatus(int reservationId, string newStatus)
        {
            var reservation = _reservationRepo.GetReservationById(reservationId);
            if (reservation == null)
                throw new Exception("Không tìm thấy đặt lịch.");

            var allowedStatuses = new[] { "Approved", "Rejected", "Cancelled" };
            if (!allowedStatuses.Contains(newStatus))
                throw new Exception("Trạng thái không hợp lệ.");

            reservation.Status = newStatus;
            _reservationRepo.UpdateReservation(reservation);
        }
    }
}
