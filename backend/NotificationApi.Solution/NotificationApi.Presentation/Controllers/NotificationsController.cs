using SharedLibrary.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationApi.Application.Services;
using System.Security.Claims;

namespace NotificationApi.Presentation.Controllers
{
    // Any signed-in user can ask for an email about their own order or invoice. Admins and technicians
    // can ask for any. The email always goes to the customer's address on file, never to one the caller types.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController(INotificationService notifications) : ControllerBase
    {
        private int CallerId => int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("nameid")
                ?? User.FindFirstValue("sub"),
            out var id) ? id : 0;

        private bool IsStaff => User.IsInRole("Admin") || User.IsInRole("Technician");

        private const string NoUserId = "Your token has no user id. Please log in again.";

        [HttpPost("orders/{orderId:int}/confirmation")]
        public async Task<ActionResult<Response>> SendOrderConfirmation(int orderId, CancellationToken ct)
        {
            if (!IsStaff && CallerId == 0) return BadRequest(new Response(false, NoUserId));

            var response = await notifications.SendOrderConfirmationAsync(
                orderId, CallerId, IsStaff, Request.Headers.Authorization.ToString(), ct);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPost("invoices/{invoiceId:int}/email")]
        public async Task<ActionResult<Response>> SendInvoice(int invoiceId, CancellationToken ct)
        {
            if (!IsStaff && CallerId == 0) return BadRequest(new Response(false, NoUserId));

            var response = await notifications.SendInvoiceAsync(
                invoiceId, CallerId, IsStaff, Request.Headers.Authorization.ToString(), ct);
            return response.Flag ? Ok(response) : BadRequest(response);
        }
    }
}
