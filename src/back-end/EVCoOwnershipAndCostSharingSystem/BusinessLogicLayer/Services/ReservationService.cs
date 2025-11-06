using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using System;
using System.Collections.Generic;
using System.Globalization;

namespace BusinessLogicLayer.Services
{
    public class ReservationService
    {

        public bool DeleteReservation(int reservationId)
        {
            return _reservationRepo.DeleteReservation(reservationId);
        }
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

        // Đơn giản: cập nhật trạng thái hợp đồng theo lịch đặt hiện tại
        public void UpdateContractStatusByReservation()
        {
            var db = new DataAccessLayer.Entities.EvcoOwnershipAndCostSharingSystemContext();
            var now = DateTime.Now;
            // Consider any reservation whose time window contains 'now'.
            // We ignore reservation.Status here so the contract is set based on time ranges only.
            var activeReservations = db.Reservations
                .Where(r => r.StartTime <= now && r.EndTime > now)
                .ToList();

            // Chỉ cập nhật trạng thái nếu đang là Active hoặc Available
            var contracts = db.Contracts.ToList();
            foreach (var contract in contracts)
            {
                if (contract.Status == "Active" || contract.Status == "Available")
                {
                    var currentRes = activeReservations.FirstOrDefault(r => r.ContractId == contract.ContractId);
                    if (currentRes != null)
                    {
                        contract.Status = "Active";
                        contract.UsingBy = currentRes.UserId;
                    }
                    else
                    {
                        contract.Status = "Available";
                        contract.UsingBy = null;
                    }
                    db.Contracts.Update(contract);
                }
                // Nếu trạng thái khác thì giữ nguyên, không đổi
            }
            db.SaveChanges();
        }

        // Lấy danh sách lịch theo tháng
        public List<Reservation> GetReservationsByContractAndMonth(int contractId, int month, int year)
        {
            return _reservationRepo.GetReservationsByContractAndMonth(contractId, month, year);
        }

        public void DeleteReservationsByContractId(int contractId)
        {
            _reservationRepo.DeleteReservationsByContractId(contractId);
        }
    }
}
