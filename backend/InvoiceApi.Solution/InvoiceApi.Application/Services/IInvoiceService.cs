using SharedLibrary.Responses;

namespace InvoiceApi.Application.Services
{
    public interface IInvoiceService
    {
        /// <summary>
        /// Builds an invoice for an order by reading the order, its service and its customer
        /// from the other APIs (through the gateway), then stores it.
        /// </summary>
        /// <param name="callerId">User id from the caller's JWT.</param>
        /// <param name="isAdmin">Admins may invoice any order; others only their own.</param>
        /// <param name="authorization">The caller's "Bearer ..." header, forwarded to the other APIs.</param>
        Task<Response> CreateFromOrderAsync(int orderId, int callerId, bool isAdmin, string? authorization);
    }
}
