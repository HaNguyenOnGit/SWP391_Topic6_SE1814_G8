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

        // API: Xóa đặt lịch theo ReservationId
        [HttpDelete("{reservationId}")]
        public IActionResult DeleteReservation(int reservationId)
        {
            var result = _reservationService.DeleteReservation(reservationId);
            if (!result) return NotFound(new { Error = "Không tìm thấy đặt lịch." });
            return Ok(new { Message = "Xoá đặt lịch thành công." });
        }
        private readonly ReservationService _reservationService;

        public ReservationController()
        {
            _reservationService = new ReservationService();
        }

        // API: Tạo đặt lịch mới
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
            catch (ArgumentException ex) // lỗi do input
            {
                return BadRequest(new { Error = ex.Message });
            }
            catch (InvalidOperationException ex) // lỗi nghiệp vụ (vd: trùng lịch)
            {
                return Conflict(new { Error = ex.Message });
            }
            catch (Exception ex) // lỗi hệ thống
            {
                return StatusCode(500, new { Error = "Có lỗi xảy ra: " + ex.Message });
            }
        }

        // ✅ API: Xóa lịch đã đặt theo contractId + datetime
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
        // API: Cập nhật trạng thái đặt lịch
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

        // API: Lấy danh sách đặt lịch theo hợp đồng và tháng
        [HttpGet("contract/{contractId}/month")]
        public IActionResult GetReservationsByContractAndMonth(int contractId, [FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                var reservations = _reservationService.GetReservationsByContractAndMonth(contractId, month, year);
                var result = reservations.Select(r => new
                {
                    r.ReservationId,
                    r.ContractId,
                    r.UserId,
                    UserName = r.User?.FullName,
                    r.StartTime,
                    r.EndTime,
                    r.Status,
                    r.CreatedAt
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
