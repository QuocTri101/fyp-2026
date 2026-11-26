using SharedLibrary.Responses;
using InvoiceApi.Application.DTOs.Remote;
using InvoiceApi.Application.Interfaces;
using InvoiceApi.Domain.Entities;
using Microsoft.Extensions.Configuration;
using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace InvoiceApi.Application.Services
{
    public class InvoiceService(IInvoice invoices, HttpClient httpClient, IConfiguration config) : IInvoiceService
    {
        public async Task<Response> CreateFromOrderAsync(int orderId, int callerId, bool isAdmin, string? authorization)
        {
            // One invoice per order.
            var existing = await invoices.GetByAsync(i => i.OrderId == orderId);
            if (existing is not null)
                return new Response(false, $"Order #{orderId} already has invoice {existing.InvoiceNumber}.");

            var order = await GetAsync<RemoteOrder>($"/api/orders/{orderId}", authorization);
            if (order is null)
                return new Response(false, $"Order #{orderId} was not found.");

            if (!isAdmin && order.ClientId != callerId)
                return new Response(false, "You can only create invoices for your own orders.");

            var product = await GetAsync<RemoteProduct>($"/api/products/{order.ProductId}", authorization);
            if (product is null)
                return new Response(false, $"The service of order #{orderId} no longer exists.");

            var customer = await GetAsync<RemoteUser>($"/api/auth/{order.ClientId}", authorization);
            if (customer is null)
                return new Response(false, "The customer of this order could not be loaded.");

            var taxRate = ReadTaxRate();
            var subtotal = product.Price * order.PurchaseQuantity;
            var tax = Math.Round(subtotal * taxRate, 2);

            var invoice = new Invoice
            {
                OrderId = order.Id,
                ClientId = order.ClientId,
                CustomerName = customer.Name,
                CustomerEmail = customer.Email,
                CustomerAddress = customer.Address,
                ServiceName = product.Name,
                UnitPrice = product.Price,
                Quantity = order.PurchaseQuantity,
                Subtotal = subtotal,
                TaxRate = taxRate,
                TaxAmount = tax,
                Total = subtotal + tax,
                PickupCode = order.PickupCode,
            };
            return await invoices.CreateAsync(invoice);
        }

        /// <summary>GET through the gateway with the caller's token. Null if it fails for any reason.</summary>
        private async Task<T?> GetAsync<T>(string path, string? authorization) where T : class
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, path);
            if (AuthenticationHeaderValue.TryParse(authorization, out var header))
                request.Headers.Authorization = header;

            using var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return null;
            return await response.Content.ReadFromJsonAsync<T>();
        }

        /// <summary>Invoice:TaxRate in appsettings, as a fraction (0.10 = 10%). Defaults to 10%.</summary>
        private decimal ReadTaxRate() =>
            decimal.TryParse(config["Invoice:TaxRate"], NumberStyles.Number, CultureInfo.InvariantCulture, out var rate)
                ? rate
                : 0.10m;
    }
}
