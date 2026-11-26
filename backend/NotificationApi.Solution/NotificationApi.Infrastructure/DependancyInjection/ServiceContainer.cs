using SharedLibrary.DependencyInjection;
using SharedLibrary.Middleware;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotificationApi.Application.Interfaces;
using NotificationApi.Infrastructure.Email;
using NotificationApi.Infrastructure.Qr;
using Serilog;

namespace NotificationApi.Infrastructure.DependancyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration config)
        {
            // This API has no database, so it cannot use SharedServiceContainer.AddSharedServices<TContext>
            // (that one needs a DbContext). It sets up the same logging and JWT scheme by hand.
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .WriteTo.Debug()
                .WriteTo.Console()
                .WriteTo.File(path: $"{config["MySerilog:FileName"]}-.text",
                    restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Information,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {message:lj}{NewLine}{Exception}",
                    rollingInterval: RollingInterval.Day)
                .CreateLogger();

            JWTAuthenticationScheme.AddJWTAuthenticationScheme(services, config);

            services.Configure<SmtpOptions>(config.GetSection("Smtp"));
            services.AddSingleton<IEmailSender, MailKitEmailSender>();
            services.AddSingleton<IQrCodeGenerator, QrCodeGenerator>();
            return services;
        }

        public static IApplicationBuilder UseInfrastructurePolicy(this IApplicationBuilder app)
        {
            // Same two middlewares as the other APIs: clean JSON errors, and gateway-only access.
            app.UseMiddleware<GlobalException>();
            app.UseMiddleware<ListenToOnlyApiGateway>();
            return app;
        }
    }
}
