using SharedLibrary.Responses;

namespace NotificationApi.Application.Services
{
    public interface INotificationService
    {
        //Emails the customer their order details and pickup QR code
        Task<Response> SendOrderConfirmationAsync(int orderId, int callerId, bool isStaff, string? authorization, CancellationToken ct);

        //Emails the customer their invoice as a PDF attachment.
        Task<Response> SendInvoiceAsync(int invoiceId, int callerId, bool isStaff, string? authorization, CancellationToken ct);
    }
}
