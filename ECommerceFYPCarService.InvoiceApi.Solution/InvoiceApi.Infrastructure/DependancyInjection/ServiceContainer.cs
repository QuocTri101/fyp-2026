using eCommerceCar.SharedLibrary.DependencyInjection;
using InvoiceApi.Application.Interfaces;
using InvoiceApi.Infrastructure.Data;
using InvoiceApi.Infrastructure.Pdf;
using InvoiceApi.Infrastructure.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InvoiceApi.Infrastructure.DependancyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration config)
        {
            // DB connection, Serilog and the JWT scheme (shared with the other APIs)
            SharedServiceContainer.AddSharedServices<InvoiceDbContext>(services, config, config["MySerilog:FileName"]!);

            services.AddScoped<IInvoice, InvoiceRepository>();
            services.AddSingleton<IInvoicePdfGenerator, InvoicePdfGenerator>();
            return services;
        }

        public static IApplicationBuilder UseInfrastructurePolicy(this IApplicationBuilder app)
        {
            // GlobalException (turns crashes into clean JSON) + ListenToOnlyApiGateway
            SharedServiceContainer.UseSharedPolicies(app);
            return app;
        }
    }
}
