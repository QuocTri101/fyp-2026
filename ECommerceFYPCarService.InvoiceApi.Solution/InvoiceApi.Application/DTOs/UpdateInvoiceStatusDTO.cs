using System.ComponentModel.DataAnnotations;

namespace InvoiceApi.Application.DTOs
{
    /// <param name="Status">Issued, Paid or Void.</param>
    public record UpdateInvoiceStatusDTO([Required] string Status);
}
