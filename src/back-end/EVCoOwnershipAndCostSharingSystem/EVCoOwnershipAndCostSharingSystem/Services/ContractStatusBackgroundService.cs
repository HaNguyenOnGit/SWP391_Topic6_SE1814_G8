using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using BusinessLogicLayer.Services;
using DataAccessLayer.Entities;

namespace EVCoOwnershipAndCostSharingSystem.Services
{
    public class ContractStatusBackgroundService : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var reservationService = new ReservationService();
            var userService = new UserService();

            // Run once immediately at startup
            try
            {
                // QUAN TRỌNG: Kiểm tra và gửi email TRƯỚC khi cập nhật trạng thái
                CheckAndNotifyOverdueCheckouts(userService);
                reservationService.UpdateContractStatusByReservation();
            }
            catch (Exception)
            {
                // optionally log
            }

            // Then schedule to run at local midnight each day
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    // next local midnight (00:00 of next day)
                    var nextMidnight = now.Date.AddDays(1);
                    var delay = nextMidnight - now;
                    if (delay.TotalMilliseconds <= 0)
                    {
                        // fallback to 24 hours
                        delay = TimeSpan.FromDays(1);
                    }

                    await Task.Delay(delay, stoppingToken);

                    // execute at (or shortly after) midnight
                    // QUAN TRỌNG: Kiểm tra và gửi email TRƯỚC khi cập nhật trạng thái
                    CheckAndNotifyOverdueCheckouts(userService);
                    reservationService.UpdateContractStatusByReservation();
                }
                catch (TaskCanceledException)
                {
                    // stopping requested
                    break;
                }
                catch (Exception)
                {
                    // log and continue to next scheduled run
                }
            }
        }

        private void CheckAndNotifyOverdueCheckouts(UserService userService)
        {
            var db = new EvcoOwnershipAndCostSharingSystemContext();
            var now = DateTime.Now;

            // Tìm tất cả contract đang Active và có UsingBy
            var activeContracts = db.Contracts
                .Where(c => c.Status == "Active" && c.UsingBy != null)
                .ToList();

            foreach (var contract in activeContracts)
            {
                if (contract.UsingBy == null) continue;

                int userId = contract.UsingBy.Value;

                // Tìm reservation đã hết hạn (EndTime < now) nhưng user vẫn đang sử dụng
                var overdueReservation = db.Reservations
                    .Where(r => r.ContractId == contract.ContractId
                               && r.UserId == userId
                               && r.EndTime < now)
                    .OrderByDescending(r => r.EndTime)
                    .FirstOrDefault();

                if (overdueReservation != null)
                {
                    // Kiểm tra xem user đã checkin nhưng chưa checkout
                    var usageLog = db.UsageLogs
                        .Where(u => u.ContractId == contract.ContractId
                                   && u.UserId == userId
                                   && u.CheckInTime != null
                                   && u.CheckOutTime == null)
                        .OrderByDescending(u => u.CheckInTime)
                        .FirstOrDefault();

                    if (usageLog != null)
                    {
                        // Gửi email nhắc nhở
                        var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                        if (user != null && !string.IsNullOrEmpty(user.Email))
                        {
                            SendCheckoutReminder(user.Email, contract.VehicleName ?? contract.LicensePlate, overdueReservation.EndTime);
                        }
                    }
                }
            }
        }

        private void SendCheckoutReminder(string email, string vehicleInfo, DateTime endTime)
        {
            try
            {
                using (var client = new System.Net.Mail.SmtpClient("smtp.gmail.com", 587))
                {
                    client.Credentials = new System.Net.NetworkCredential("phuhung258@gmail.com", "zrsw mewp lawc osxa");
                    client.EnableSsl = true;

                    var mail = new System.Net.Mail.MailMessage();
                    mail.From = new System.Net.Mail.MailAddress("phuhung258@gmail.com", "EVCO System");
                    mail.To.Add(email);
                    mail.Subject = "Nhắc nhở: Vui lòng checkout xe";
                    mail.Body = $"Bạn đã quá thời gian đặt lịch cho xe {vehicleInfo} (kết thúc lúc {endTime:dd/MM/yyyy HH:mm}). Vui lòng thực hiện checkout sớm nhất có thể.";

                    client.Send(mail);
                }
            }
            catch (Exception)
            {
                // log error if needed
            }
        }
    }
}