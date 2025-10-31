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
            // Run once immediately at startup
            try
            {
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
    }
}