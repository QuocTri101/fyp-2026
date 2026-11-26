using NotificationApi.Application.DTOs;
using NotificationApi.Application.DTOs.Remote;
using System.Globalization;
using System.Net;

namespace NotificationApi.Application.Templates
{
    // Builds the subject and body of each email. Every value that comes from a user or a database
    // is HTML-encoded, so a customer named "&lt;script&gt;" cannot inject markup into the email.
    public static class EmailTemplates
    {
        public const string QrContentId = "pickup-qr@carservice";

        private static string Enc(string? text) => WebUtility.HtmlEncode(text ?? string.Empty);
        private static string Money(decimal value) => value.ToString("N2", CultureInfo.InvariantCulture);

        //ABCD1234 becomes ABCD-1234, easier to read out loud
        public static string FormatCode(string code) =>
            code.Length == 8 ? $"{code[..4]}-{code[4..]}" : code;

        public static EmailMessage OrderConfirmation(
            string company, RemoteUser customer, RemoteOrder order, RemoteProduct product, byte[] qrPng)
        {
            var code = FormatCode(order.PickupCode!);
            var total = product.Price * order.PurchaseQuantity;

            var html = $"""
                <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#14202B">
                  <div style="background:#14202B;color:#F2C200;padding:16px 20px;font-size:22px;font-weight:bold">{Enc(company)}</div>
                  <div style="padding:20px;border:1px solid #D3DBE0;border-top:0">
                    <p>Hello {Enc(customer.Name)},</p>
                    <p>Your order is confirmed. Show the QR code below to our staff to receive your service.</p>
                    <table style="width:100%;border-collapse:collapse;margin:16px 0">
                      <tr><td style="padding:6px 0;color:#566673">Order</td><td style="text-align:right"><b>#{order.Id:D4}</b></td></tr>
                      <tr><td style="padding:6px 0;color:#566673">Service</td><td style="text-align:right">{Enc(product.Name)}</td></tr>
                      <tr><td style="padding:6px 0;color:#566673">Quantity</td><td style="text-align:right">{order.PurchaseQuantity}</td></tr>
                      <tr><td style="padding:6px 0;color:#566673">Total</td><td style="text-align:right"><b>{Money(total)}</b></td></tr>
                      <tr><td style="padding:6px 0;color:#566673">Ordered on</td><td style="text-align:right">{order.OrderDate:yyyy-MM-dd HH:mm} UTC</td></tr>
                    </table>
                    <div style="text-align:center;margin:24px 0">
                      <img src="cid:{QrContentId}" alt="Pickup QR code" width="200" height="200" />
                      <p style="font-size:22px;letter-spacing:2px;margin:8px 0"><b>{Enc(code)}</b></p>
                      <p style="color:#566673;margin:0">No camera? Read this code to our staff.</p>
                    </div>
                    <p style="color:#566673;font-size:13px">This code works once. Please do not share it with anyone.</p>
                  </div>
                </div>
                """;

            var text = $"""
                Hello {customer.Name},

                Your order #{order.Id:D4} is confirmed.
                Service: {product.Name} x {order.PurchaseQuantity}
                Total: {Money(total)}

                Your pickup code: {code}
                Show it to our staff to receive your service. It works once, so please do not share it.
                """;

            return new EmailMessage(
                customer.Email, customer.Name,
                $"Order #{order.Id:D4} confirmed: your pickup code",
                html, text,
                InlineImages: [new InlineImage(QrContentId, "pickup-code.png", "image/png", qrPng)]);
        }

        public static EmailMessage Invoice(string company, RemoteUser customer, RemoteInvoice invoice, byte[] pdf)
        {
            var html = $"""
                <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#14202B">
                  <div style="background:#14202B;color:#F2C200;padding:16px 20px;font-size:22px;font-weight:bold">{Enc(company)}</div>
                  <div style="padding:20px;border:1px solid #D3DBE0;border-top:0">
                    <p>Hello {Enc(customer.Name)},</p>
                    <p>Your invoice <b>{Enc(invoice.InvoiceNumber)}</b> for order #{invoice.OrderId:D4} is attached as a PDF.</p>
                    <p style="font-size:18px">Total: <b>{Money(invoice.Total)}</b></p>
                    <p style="color:#566673;font-size:13px">Issued on {invoice.IssuedAt:yyyy-MM-dd}.</p>
                  </div>
                </div>
                """;

            var text = $"""
                Hello {customer.Name},

                Your invoice {invoice.InvoiceNumber} for order #{invoice.OrderId:D4} is attached as a PDF.
                Total: {Money(invoice.Total)}
                Issued on {invoice.IssuedAt:yyyy-MM-dd}.
                """;

            return new EmailMessage(
                customer.Email, customer.Name,
                $"Invoice {invoice.InvoiceNumber}",
                html, text,
                Attachments: [new EmailAttachment($"{invoice.InvoiceNumber}.pdf", "application/pdf", pdf)]);
        }
    }
}
