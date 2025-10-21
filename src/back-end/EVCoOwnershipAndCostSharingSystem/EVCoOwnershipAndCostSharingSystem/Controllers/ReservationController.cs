using BusinessLogicLayer.Others;
using BusinessLogicLayer.Services;
using Microsoft.AspNetCore.Mvc;
using System;

namespace EVCoOwnershipAndCostSharingSystem.Controllers
{
    [ApiController]
    [Route("api/reservation")]
    public class ReservationController : ControllerBase
    {

        // DELETE api/reservation/{reservationId}
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

        // POST api/reservation
        [HttpPost("reservationRequest")]
        public IActionResult CreateReservation([FromBody] ReservationRequest request)
        {
            if (request == null)
                return BadRequest("Request không hợp lệ");
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
                    Message = "Đặt lịch thành công!!",
                    Data = reservation
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

        // GET api/reservation/contract/{contractId}?date=yyyy-MM-dd
        [HttpGet("contract/{contractId}")]
        public IActionResult GetReservationsByContract(int contractId, [FromQuery] DateTime date)
        {
            try
            {
                var reservations = _reservationService.GetReservationsByContractAndDate(contractId, date);
                var result = reservations.Select(r => new {
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

        // PUT api/reservation/{reservationId}/status?newStatus=Approved
        [HttpPut("{reservationId}/status")]
        public IActionResult UpdateReservationStatus(int reservationId, [FromQuery] string newStatus)
        {
            try
            {
                _reservationService.UpdateReservationStatus(reservationId, newStatus);
                return Ok($"Cập nhật trạng thái đặt lịch {reservationId} thành {newStatus} thành công.");
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
