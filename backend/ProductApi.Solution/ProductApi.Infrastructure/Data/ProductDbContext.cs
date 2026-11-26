using Microsoft.EntityFrameworkCore;
using ProductApi.Domain.Entities;

namespace ProductApi.Infrastructure.Data
{
    public class ProductDbContext(DbContextOptions<ProductDbContext> options) : DbContext(options)
    {
        public DbSet<Product> Products { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>(e =>
            {
                e.Property(p => p.Barcode).HasMaxLength(14);

                // Unique, but only among products that have a barcode (many rows may be NULL).
                e.HasIndex(p => p.Barcode).IsUnique().HasFilter("[Barcode] IS NOT NULL");

                // Keeps money exact and silences the EF "decimal may be truncated" warning.
                e.Property(p => p.Price).HasPrecision(18, 2);
            });
        }
    }

}
