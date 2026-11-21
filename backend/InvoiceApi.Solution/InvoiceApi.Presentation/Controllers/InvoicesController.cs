using SharedLibrary.Responses;
using InvoiceApi.Application.DTOs;
using InvoiceApi.Application.DTOs.Conversions;
using InvoiceApi.Application.Interfaces;
using InvoiceApi.Application.Services;
using InvoiceApi.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InvoiceApi.Presentation.Controllers
{
    /// <summary>
    /// Admins see and manage every invoice. Everyone else sees only their own (matched on the
    /// user id inside the JWT, never on a value sent by the client).
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InvoicesController(
        IInvoice invoices,
        IInvoiceService invoiceService,
        IInvoicePdfGenerator pdf) : ControllerBase
    {
        private int CallerId => int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("nameid")
                ?? User.FindFirstValue("sub"),
            out var id) ? id : 0;

        private bool IsAdmin => User.IsInRole("Admin");

        private bool CanAccess(Invoice invoice) => IsAdmin || invoice.ClientId == CallerId;

        private const string NoUserId = "Your token has no user id. Please log in again.";

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InvoiceDTO>>> GetInvoices()
        {
            if (!IsAdmin && CallerId == 0) return BadRequest(new Response(false, NoUserId));

            var list = IsAdmin
                ? await invoices.GetAllAsync()
                : await invoices.GetInvoicesAsync(i => i.ClientId == CallerId);
            return Ok(InvoiceConversion.ToDTOs(list));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<InvoiceDTO>> GetInvoice(int id)
        {
            var invoice = await invoices.FindByIdAsync(id);
            if (invoice is null) return NotFound();
            if (!CanAccess(invoice)) return Forbid();
            return Ok(InvoiceConversion.ToDTO(invoice));
        }

        [HttpGet("{id:int}/pdf")]
        public async Task<IActionResult> GetInvoicePdf(int id)
        {
            var invoice = await invoices.FindByIdAsync(id);
            if (invoice is null) return NotFound();
            if (!CanAccess(invoice)) return Forbid();
            return File(pdf.Generate(invoice), "application/pdf", $"{invoice.InvoiceNumber}.pdf");
        }

        [HttpPost("from-order/{orderId:int}")]
        public async Task<ActionResult<Response>> CreateFromOrder(int orderId)
        {
            if (!IsAdmin && CallerId == 0) return BadRequest(new Response(false, NoUserId));

            var response = await invoiceService.CreateFromOrderAsync(
                orderId, CallerId, IsAdmin, Request.Headers.Authorization.ToString());
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id:int}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Response>> UpdateStatus(int id, UpdateInvoiceStatusDTO dto)
        {
            if (!Enum.TryParse<InvoiceStatus>(dto.Status, ignoreCase: true, out var status))
                return BadRequest(new Response(false, "Status must be Issued, Paid or Void."));

            var invoice = await invoices.FindByIdAsync(id);
            if (invoice is null) return NotFound();

            invoice.Status = status;
            var response = await invoices.UpdateAsync(invoice);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Response>> DeleteInvoice(int id)
        {
            var invoice = await invoices.FindByIdAsync(id);
            if (invoice is null) return NotFound();

            var response = await invoices.DeleteAsync(invoice);
            return response.Flag ? Ok(response) : BadRequest(response);
        }
    }
}
