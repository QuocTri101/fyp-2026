using SharedLibrary.Responses;

namespace InvoiceApi.Application.Services
{
    public interface IInvoiceService
    {
        // Reads the order, its service and its customer through the gateway, then stores the invoice.
        Task<Response> CreateFromOrderAsync(int orderId, int callerId, bool isAdmin, string? authorization);
    }
}