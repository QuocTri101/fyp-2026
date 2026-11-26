using Microsoft.EntityFrameworkCore;
using OrderApi.Domain.Entities;

namespace OrderApi.Infrastructure.Data
{
    public class OrderDbContext(DbContextOptions<OrderDbContext> options) : DbContext(options)
    {
        public DbSet<Order> Orders { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Order>(e =>
            {
                e.Property(o => o.PickupCode).HasMaxLength(12);
                e.HasIndex(o => o.PickupCode).IsUnique().HasFilter("[PickupCode] IS NOT NULL");

                e.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
                e.HasIndex(o => o.ClientId);
            });
        }
    }
}
