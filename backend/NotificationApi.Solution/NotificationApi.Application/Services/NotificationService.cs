using SharedLibrary.Logs;
using SharedLibrary.Responses;
using Microsoft.Extensions.Configuration;
using NotificationApi.Application.DTOs.Remote;
using NotificationApi.Application.Interfaces;
using NotificationApi.Application.Templates;
using System.Collections.Concurrent;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace NotificationApi.Application.Services
{
    // Collects the data from the other APIs(through the gateway, with the caller's own token),
    // builds the email and hands it to the sender.
    public class NotificationService(
        HttpClient http, IEmailSender mail, IQrCodeGenerator qr, IConfiguration config) : INotificationService
    {
        // Stops a double click (or a script) from flooding someone's inbox.
        private static readonly ConcurrentDictionary<string, DateTime> LastSent = new();
        private static readonly TimeSpan Cooldown = TimeSpan.FromSeconds(60);

        private string Company => config["Notification:CompanyName"] ?? "Car Service";

        public async Task<Response> SendOrderConfirmationAsync(
            int orderId, int callerId, bool isStaff, string? authorization, CancellationToken ct)
        {
            var key = $"order:{orderId}";
            if (TooSoon(key))
                return new Response(false, "A confirmation for this order was sent a moment ago. Please wait a minute.");

            try
            {
                var order = await GetAsync<RemoteOrder>($"/api/orders/{orderId}", authorization, ct);
                if (order is null || (!isStaff && order.ClientId != callerId))
                    return new Response(false, "Order not found, or it is not yours.");

                if (string.IsNullOrEmpty(order.PickupCode))
                    return new Response(false, "This order has no pickup code yet. Edit and save it once, or place a new order.");

                var product = await GetAsync<RemoteProduct>($"/api/products/{order.ProductId}", authorization, ct);
                if (product is null)
                    return new Response(false, "The service of this order no longer exists.");

                var customer = await GetAsync<RemoteUser>($"/api/auth/{order.ClientId}", authorization, ct);
                if (customer is null || string.IsNullOrWhiteSpace(customer.Email))
                    return new Response(false, "The customer's email address could not be loaded.");

                var message = EmailTemplates.OrderConfirmation(
                    Company, customer, order, product, qr.CreatePng(order.PickupCode));
                await mail.SendAsync(message, ct);

                LastSent[key] = DateTime.UtcNow;
                return new Response(true, $"Confirmation sent to {Mask(customer.Email)}.");
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                return new Response(false, "The email could not be sent. Check the SMTP settings and try again.");
            }
        }

        public async Task<Response> SendInvoiceAsync(
            int invoiceId, int callerId, bool isStaff, string? authorization, CancellationToken ct)
        {
            var key = $"invoice:{invoiceId}";
            if (TooSoon(key))
                return new Response(false, "This invoice was emailed a moment ago. Please wait a minute.");

            try
            {
                var invoice = await GetAsync<RemoteInvoice>($"/api/invoices/{invoiceId}", authorization, ct);
                if (invoice is null || (!isStaff && invoice.ClientId != callerId))
                    return new Response(false, "Invoice not found, or it is not yours.");

                var pdf = await GetBytesAsync($"/api/invoices/{invoiceId}/pdf", authorization, ct);
                if (pdf is null)
                    return new Response(false, "The invoice PDF could not be loaded.");

                var customer = await GetAsync<RemoteUser>($"/api/auth/{invoice.ClientId}", authorization, ct);
                if (customer is null || string.IsNullOrWhiteSpace(customer.Email))
                    return new Response(false, "The customer's email address could not be loaded.");

                await mail.SendAsync(EmailTemplates.Invoice(Company, customer, invoice, pdf), ct);

                LastSent[key] = DateTime.UtcNow;
                return new Response(true, $"Invoice {invoice.InvoiceNumber} sent to {Mask(customer.Email)}.");
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                return new Response(false, "The email could not be sent. Check the SMTP settings and try again.");
            }
        }


        private static bool TooSoon(string key) =>
            LastSent.TryGetValue(key, out var at) && DateTime.UtcNow - at < Cooldown;

        //tri@example.com becomes t**@example.com, so the screen does not show the full address.
        private static string Mask(string email)
        {
            var at = email.IndexOf('@');
            return at <= 1 ? email : $"{email[0]}{new string('*', at - 1)}{email[at..]}";
        }

        private HttpRequestMessage Authorized(string path, string? authorization)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, path);
            if (AuthenticationHeaderValue.TryParse(authorization, out var header))
                request.Headers.Authorization = header;
            return request;
        }

        private async Task<T?> GetAsync<T>(string path, string? authorization, CancellationToken ct) where T : class
        {
            using var request = Authorized(path, authorization);
            using var response = await http.SendAsync(request, ct);
            return response.IsSuccessStatusCode ? await response.Content.ReadFromJsonAsync<T>(ct) : null;
        }

        private async Task<byte[]?> GetBytesAsync(string path, string? authorization, CancellationToken ct)
        {
            using var request = Authorized(path, authorization);
            using var response = await http.SendAsync(request, ct);
            return response.IsSuccessStatusCode ? await response.Content.ReadAsByteArrayAsync(ct) : null;
        }
    }
}
