using NotificationApi.Application.Interfaces;
using QRCoder;

namespace NotificationApi.Infrastructure.Qr
{
    public class QrCodeGenerator : IQrCodeGenerator
    {
        public byte[] CreatePng(string text)
        {
            using var generator = new QRCodeGenerator();
            using var data = generator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
            return new PngByteQRCode(data).GetGraphic(10);
        }
    }
}
