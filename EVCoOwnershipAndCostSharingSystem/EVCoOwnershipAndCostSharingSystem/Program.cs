
using BusinessLogicLayer.Services;
using DataAccessLayer.Repositories;

namespace EVCoOwnershipAndCostSharingSystem
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var emailConfig = builder.Configuration.GetSection("EmailSettings");
            builder.Services.AddSingleton(new EmailService(
                emailConfig["SmtpServer"],
                int.Parse(emailConfig["SmtpPort"]),
                emailConfig["SmtpUser"],
                emailConfig["SmtpPass"],
                emailConfig["FromEmail"]
            ));

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddScoped<UserService>();
            builder.Services.AddScoped<UserRepository>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
