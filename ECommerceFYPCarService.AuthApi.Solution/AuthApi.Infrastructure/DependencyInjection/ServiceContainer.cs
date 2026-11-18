using AuthApi.Application.DTOs.Interface;
using AuthApi.Infrastructure.Data;
using AuthApi.Infrastructure.Repositories;
using eCommerceCar.SharedLibrary.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AuthApi.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            //Add database connectivity
            //Add authentication scheme
            SharedServiceContainer.AddSharedServices<AuthDbContext>(services, config, config["MySerilog:FileName"]!);

            //Create DependancyInjection
            services.AddScoped<IUser, UserRepository>();
            return services;
        }
        public static IApplicationBuilder UserInfrastructurePolicy(this IApplicationBuilder app)
        {
            //Register middleware: GlobalException (handle external errors), ListenOnlyToApiGateway (block outside call)
            SharedServiceContainer.UseSharedPolicies(app);

            return app;
        }
    }
}
