using InvoiceApi.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InvoiceApi.Application.DependancyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddApplicationService(this IServiceCollection services, IConfiguration config)
        {
            // Typed HttpClient: InvoiceService calls the other APIs through the gateway, never directly.
            services.AddHttpClient<IInvoiceService, InvoiceService>(options =>
            {
                options.BaseAddress = new Uri(config["ApiGateway:BaseAddress"]
                    ?? throw new InvalidOperationException("Missing setting ApiGateway:BaseAddress."));
                options.Timeout = TimeSpan.FromSeconds(10);
            });
            return services;
        }
    }
}
