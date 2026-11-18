namespace AuthApi.Domain.Entities
{
    public class AppUser
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Adress { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
        public DateTime DateRegistered { get; set; } = DateTime.UtcNow;

    }
}
