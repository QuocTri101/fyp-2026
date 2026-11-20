using InvoiceApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InvoiceApi.Infrastructure.Data
{
    public class InvoiceDbContext(DbContextOptions<InvoiceDbContext> options) : DbContext(options)
    {
        public DbSet<Invoice> Invoices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Invoice>(e =>
            {
                e.Property(i => i.InvoiceNumber).HasMaxLength(50).IsRequired();
                e.HasIndex(i => i.InvoiceNumber).IsUnique();
                e.HasIndex(i => i.OrderId).IsUnique();   // one invoice per order
                e.HasIndex(i => i.ClientId);

                e.Property(i => i.Status).HasConversion<string>().HasMaxLength(20);

                e.Property(i => i.UnitPrice).HasPrecision(18, 2);
                e.Property(i => i.Subtotal).HasPrecision(18, 2);
                e.Property(i => i.TaxAmount).HasPrecision(18, 2);
                e.Property(i => i.Total).HasPrecision(18, 2);
                e.Property(i => i.TaxRate).HasPrecision(5, 4);
            });
        }
    }
}
