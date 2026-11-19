using Microsoft.AspNetCore.Http;
namespace eCommerceCar.SharedLibrary.Middleware
{
    public class ListenToOnlyApiGateway(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            //extract specific header from request
            var signedHeader = context.Request.Headers["Api-Gateway"];
            //null means, the request is not coming from the api gateway// 503 service un
            if(signedHeader.FirstOrDefault() is null)
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                await context.Response.WriteAsync("Sorry, service is unavailable");
                return;
            }
            else
            {
                await next(context);
            }
        }
    }
}
