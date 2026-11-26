using NotificationApi.Application.DTOs;

namespace NotificationApi.Application.Interfaces
{
    //Sends one email. The Infrastructure project decides how (SMTP today)
    public interface IEmailSender
    {
        Task SendAsync(EmailMessage message, CancellationToken ct = default);
    }
}
