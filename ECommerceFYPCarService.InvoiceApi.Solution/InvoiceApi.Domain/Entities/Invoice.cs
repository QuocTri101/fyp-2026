namespace InvoiceApi.Domain.Entities
{
    /// <summary>
    /// A snapshot of an order at the moment it was invoiced. Customer and service details are
    /// copied in on purpose: an issued invoice must not change when the user or service is edited later.
    /// OrderId and ClientId point to rows owned by other services, so there are no database foreign keys.
    /// </summary>
    public class Invoice
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;

        public int OrderId { get; set; }
        public int ClientId { get; set; }

        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;

        public string ServiceName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }

        public decimal Subtotal { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal Total { get; set; }

        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Issued;
    }
}
