using InvoiceApi.Domain.Entities;

namespace InvoiceApi.Application.DTOs.Conversions
{
    public static class InvoiceConversion
    {
        public static InvoiceDTO ToDTO(Invoice i) => new(
            i.Id,
            i.InvoiceNumber,
            i.OrderId,
            i.ClientId,
            i.CustomerName,
            i.CustomerEmail,
            i.CustomerAddress,
            i.ServiceName,
            i.UnitPrice,
            i.Quantity,
            i.Subtotal,
            i.TaxRate,
            i.TaxAmount,
            i.Total,
            i.IssuedAt,
            i.Status.ToString(),
            i.PickupCode);

        public static IEnumerable<InvoiceDTO> ToDTOs(IEnumerable<Invoice> invoices) =>
            invoices.Select(ToDTO);
    }
}
