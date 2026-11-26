namespace NotificationApi.Application.DTOs
{
    //A picture shown inside the email body (referenced in the HTML as src="cid:ContentId")
    public record InlineImage(string ContentId, string FileName, string ContentType, byte[] Content);

    //A file attached to the email
    public record EmailAttachment(string FileName, string ContentType, byte[] Content);

    //Everything the sender needs. It knows nothing about orders or invoices
    public record EmailMessage(
        string ToAddress,
        string ToName,
        string Subject,
        string HtmlBody,
        string TextBody,
        IReadOnlyList<InlineImage>? InlineImages = null,
        IReadOnlyList<EmailAttachment>? Attachments = null);
}
