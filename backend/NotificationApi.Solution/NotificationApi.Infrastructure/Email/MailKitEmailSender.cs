using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using NotificationApi.Application.DTOs;
using NotificationApi.Application.Interfaces;

namespace NotificationApi.Infrastructure.Email
{
    public class MailKitEmailSender(IOptions<SmtpOptions> options) : IEmailSender
    {
        public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
        {
            var smtp = options.Value;

            var mime = new MimeMessage();
            mime.From.Add(new MailboxAddress(smtp.FromName, smtp.FromAddress));
            mime.To.Add(new MailboxAddress(message.ToName, message.ToAddress));
            mime.Subject = message.Subject;

            // HTML plus a plain-text copy: mail programs that cannot show HTML fall back to the text.
            var body = new BodyBuilder { HtmlBody = message.HtmlBody, TextBody = message.TextBody };

            foreach (var image in message.InlineImages ?? [])
            {
                var resource = body.LinkedResources.Add(image.FileName, image.Content, ContentType.Parse(image.ContentType));
                resource.ContentId = image.ContentId;
            }
            foreach (var file in message.Attachments ?? [])
                body.Attachments.Add(file.FileName, file.Content, ContentType.Parse(file.ContentType));

            mime.Body = body.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                smtp.Host, smtp.Port,
                smtp.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.None, ct);

            if (!string.IsNullOrEmpty(smtp.User))
                await client.AuthenticateAsync(smtp.User, smtp.Password ?? string.Empty, ct);

            await client.SendAsync(new SendRequest(mime), ct);
            await client.DisconnectAsync(true, ct);
        }
    }
}
