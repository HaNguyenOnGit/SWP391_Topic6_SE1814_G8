
using BusinessLogicLayer.Services;
using DataAccessLayer.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
            builder.Services.AddSingleton<AuthService>();
            builder.Services.AddScoped<UserRepository>();

            // Configure JWT authentication
            var jwtSection = builder.Configuration.GetSection("JwtSettings");
            var jwtKey = jwtSection["Key"] ?? throw new Exception("JwtSettings:Key not configured");
            var issuer = jwtSection["Issuer"] ?? "EVCo";
            var audience = jwtSection["Audience"] ?? "EVCoClients";

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                };
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
