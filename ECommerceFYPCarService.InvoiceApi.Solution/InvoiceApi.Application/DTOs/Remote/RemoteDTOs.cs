namespace InvoiceApi.Application.DTOs.Remote
{
    // Shapes of what the other services return through the gateway.
    // Only the fields the invoice needs are listed; extra JSON properties are ignored.

    /// <summary>GET /api/orders/{id} (OrderApi)</summary>
    public record RemoteOrder(int Id, int ProductId, int ClientId, int PurchaseQuantity, DateTime OrderDate);

    /// <summary>GET /api/products/{id} (ProductApi)</summary>
    public record RemoteProduct(int Id, string Name, int Quantity, decimal Price);

    /// <summary>GET /api/auth/{id} (AuthApi)</summary>
    public record RemoteUser(int Id, string Name, string PhoneNumber, string Address, string Email, string Role);
}
