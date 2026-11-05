using eCommerceCar.SharedLibrary.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OrderApi.Application.Interfaces;
using OrderApi.Infrastructure.Data;
using OrderApi.Infrastructure.Repositories;
namespace OrderApi.Infrastructure.DependancyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration config)
        {
            //Add DB connectivity
            //Add auth scheme
            SharedServiceContainer.AddSharedServices<OrderDbContext>(services, config, config["MySerilog:Filename"]!);
            //Create Dependency Injection
            services.AddScoped<IOrder, OrderRepository>();
            return services;
        }
        public static IApplicationBuilder UserInfrasturePolicy(this IApplicationBuilder app)
        {
            //Register middleware: Global Except -> handle external error, ListenToApiGateway -> block all outsiders call
            SharedServiceContainer.UseSharedPolicies(app);
            return app;
        }
    }
}
