using BusinessLogicLayer.Others;
using BusinessLogicLayer.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Globalization;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/reservation")]
    public class ReservationController : ControllerBase
    {
        private readonly ReservationService _reservationService;

        public ReservationController()
        {
            _reservationService = new ReservationService();
        }

        // ✅ 1. Thêm lịch
        [HttpPost]
        public IActionResult CreateReservation([FromBody] ReservationRequest request)
        {
            try
            {
                var reservation = _reservationService.CreateReservation(
                    request.ContractId,
                    request.UserId,
                    request.StartTime,
                    request.EndTime
                );

                return Ok(new
                {
                    Message = "Đặt lịch thành công!",
                    Data = new
                    {
                        reservation.ReservationId,
                        reservation.ContractId,
                        reservation.UserId,
                        StartTime = reservation.StartTime.ToString("yyyy-MM-dd HH:mm"),
                        EndTime = reservation.EndTime.ToString("yyyy-MM-dd HH:mm"),
                        reservation.Status
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // ✅ 2. Lấy danh sách lịch theo ngày
        [HttpGet("{contractId}/{date}")]
        public IActionResult GetReservationsByContract(int contractId, string date)
        {
            try
            {
                var reservations = _reservationService.GetReservationsByContractAndDate(contractId, date);
                var result = reservations.Select(r => new
                {
                    r.ReservationId,
                    r.ContractId,
                    r.UserId,
                    StartTime = r.StartTime.ToString("yyyy-MM-dd HH:mm"),
                    EndTime = r.EndTime.ToString("yyyy-MM-dd HH:mm"),
                    r.Status
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // ✅ 3. Xóa lịch
        [HttpDelete("{contractId}/{datetime}")]
        public IActionResult DeleteReservation(int contractId, string datetime)
        {
            try
            {
                _reservationService.DeleteReservation(contractId, datetime);
                return Ok(new { Message = $"Đã xóa lịch đặt của contract {contractId} tại {datetime}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPut("{reservationId}/status")]
        public IActionResult UpdateReservationStatus(int reservationId, [FromQuery] string newStatus)
        {
            try
            {
                _reservationService.UpdateReservationStatus(reservationId, newStatus);
                return Ok(new { Message = $"Cập nhật trạng thái đặt lịch {reservationId} thành công: {newStatus}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
