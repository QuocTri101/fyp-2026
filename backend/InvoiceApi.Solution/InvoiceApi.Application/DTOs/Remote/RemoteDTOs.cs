using Microsoft.Identity.Client.NativeInterop;

namespace InvoiceApi.Application.DTOs.Remote
{
    // Shapes of what the other services return through the gateway.
    // Only the fields the invoice needs are listed; extra JSON properties are ignored.

    // GET /api/orders/{id} (OrderApi)
    public record RemoteOrder(int Id, int ProductId, int ClientId, int PurchaseQuantity, DateTime OrderDate,
                          string? PickupCode = null);

    // GET /api/products/{id} (ProductApi)
    public record RemoteProduct(int Id, string Name, int Quantity, decimal Price);

    // GET /api/auth/{id} (AuthApi)
    public record RemoteUser(int Id, string Name, string PhoneNumber, string Address, string Email, string Role);
    
}
