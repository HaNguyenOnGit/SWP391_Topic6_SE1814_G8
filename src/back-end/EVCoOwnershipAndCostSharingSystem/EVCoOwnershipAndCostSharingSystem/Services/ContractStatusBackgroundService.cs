using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using BusinessLogicLayer.Services;

namespace EVCoOwnershipAndCostSharingSystem.Services
{
    public class ContractStatusBackgroundService : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var reservationService = new ReservationService();
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    reservationService.UpdateContractStatusByReservation();
                }
                catch (Exception ex)
                {
                    // Log lỗi nếu cần
                }
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}