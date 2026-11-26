namespace NotificationApi.Infrastructure.Email
{
    //Bound to the "Smtp" section of appsettings.json.
    public class SmtpOptions
    {
        public string Host { get; set; } = "localhost";
        public int Port { get; set; } = 25;

        //true for Gmail and most real providers (port 587). false for Papercut.
        public bool UseStartTls { get; set; }

        //Leave empty when the server needs no login (Papercut).
        public string? User { get; set; }
        public string? Password { get; set; }

        public string FromAddress { get; set; } = "no-reply@carservice.local";
        public string FromName { get; set; } = "Car Service";
    }
}
