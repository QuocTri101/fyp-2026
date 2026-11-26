namespace NotificationApi.Application.Interfaces
{
    public interface IQrCodeGenerator
    {
        //A PNG picture of a QR code that contains the given text.
        byte[] CreatePng(string text);
    }
}
