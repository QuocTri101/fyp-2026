using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotificationApi.Application.Services;

namespace NotificationApi.Application.DependancyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddApplicationService(this IServiceCollection services, IConfiguration config)
        {
            // Typed HttpClient: the service calls the other APIs through the gateway, never directly.
            services.AddHttpClient<INotificationService, NotificationService>(options =>
            {
                options.BaseAddress = new Uri(config["ApiGateway:BaseAddress"]
                    ?? throw new InvalidOperationException("Missing setting ApiGateway:BaseAddress."));
                options.Timeout = TimeSpan.FromSeconds(20);   // the invoice PDF is generated on demand
            });
            return services;
        }
    }
}
