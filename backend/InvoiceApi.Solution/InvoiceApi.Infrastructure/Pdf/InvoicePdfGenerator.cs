using InvoiceApi.Application.Interfaces;
using InvoiceApi.Domain.Entities;
using Microsoft.Extensions.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;

namespace InvoiceApi.Infrastructure.Pdf
{
    public class InvoicePdfGenerator(IConfiguration config) : IInvoicePdfGenerator
    {
        static InvoicePdfGenerator()
        {
            // QuestPDF's free license for small projects and education.
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public byte[] Generate(Invoice invoice)
        {
            var company = config["Invoice:CompanyName"] ?? "Car Service";

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(company).FontSize(20).Bold();
                            col.Item().Text("INVOICE").FontSize(12).FontColor(Colors.Grey.Darken1);
                        });
                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text($"Invoice no: {invoice.InvoiceNumber}").Bold();
                            col.Item().Text($"Date: {invoice.IssuedAt:yyyy-MM-dd}");
                            col.Item().Text($"Order: #{invoice.OrderId}");
                            col.Item().Text($"Status: {invoice.Status}");
                        });
                    });

                    page.Content().PaddingVertical(25).Column(col =>
                    {
                        col.Spacing(20);

                        col.Item().Column(c =>
                        {
                            c.Item().Text("Bill to").Bold();
                            c.Item().Text(invoice.CustomerName);
                            c.Item().Text(invoice.CustomerEmail);
                            c.Item().Text(invoice.CustomerAddress);
                        });

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(4);
                                c.RelativeColumn(1);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Element(HeaderCell).Text("Service");
                                h.Cell().Element(HeaderCell).AlignRight().Text("Qty");
                                h.Cell().Element(HeaderCell).AlignRight().Text("Unit price");
                                h.Cell().Element(HeaderCell).AlignRight().Text("Amount");
                            });

                            table.Cell().Element(BodyCell).Text(invoice.ServiceName);
                            table.Cell().Element(BodyCell).AlignRight().Text(invoice.Quantity.ToString());
                            table.Cell().Element(BodyCell).AlignRight().Text($"{invoice.UnitPrice:N2}");
                            table.Cell().Element(BodyCell).AlignRight().Text($"{invoice.Subtotal:N2}");
                        });

                        col.Item().AlignRight().Column(c =>
                        {
                            c.Item().Text($"Subtotal: {invoice.Subtotal:N2}");
                            c.Item().Text($"Tax ({invoice.TaxRate:P0}): {invoice.TaxAmount:N2}");
                            c.Item().Text($"Total: {invoice.Total:N2}").Bold().FontSize(14);
                        });
                        if (!string.IsNullOrEmpty(invoice.PickupCode))
                        {
                            var qrPng = MakeQr(invoice.PickupCode);
                            col.Item().Row(r =>
                            {
                                r.ConstantItem(110).Image(qrPng).FitArea();
                                r.RelativeItem().PaddingLeft(12).Column(c =>
                                {
                                    c.Item().Text("Your service pickup code").Bold();
                                    c.Item().Text($"{invoice.PickupCode[..4]}-{invoice.PickupCode[4..]}").FontSize(16).Bold();
                                    c.Item().Text("Show this QR code to our staff to receive your service.")
                                            .FontColor(Colors.Grey.Darken1);
                                });
                            });
                        }
                    });

                    page.Footer().AlignCenter().Text(t =>
                    {
                        t.Span("Thank you for your business. Page ");
                        t.CurrentPageNumber();
                    });
                });
            }).GeneratePdf();
        }

        private static IContainer HeaderCell(IContainer c) =>
            c.Background(Colors.Grey.Lighten3).Padding(6).DefaultTextStyle(x => x.SemiBold());
        private static byte[] MakeQr(string text)
        {
            using var generator = new QRCodeGenerator();
            using var data = generator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
            return new PngByteQRCode(data).GetGraphic(10);
        }

        private static IContainer BodyCell(IContainer c) =>
            c.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6);
    }
}
