using InvoiceApi.Domain.Entities;

namespace InvoiceApi.Application.Interfaces
{
    public interface IInvoicePdfGenerator
    {
        /// <summary>Renders the invoice as a PDF file.</summary>
        byte[] Generate(Invoice invoice);
    }
}
