namespace InvoiceApi.Application.DTOs
{
    public record InvoiceDTO(
        int Id,
        string InvoiceNumber,
        int OrderId,
        int ClientId,
        string CustomerName,
        string CustomerEmail,
        string CustomerAddress,
        string ServiceName,
        decimal UnitPrice,
        int Quantity,
        decimal Subtotal,
        decimal TaxRate,
        decimal TaxAmount,
        decimal Total,
        DateTime IssuedAt,
        string Status
    );
}
