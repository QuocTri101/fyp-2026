using SharedLibrary.Logs;
using SharedLibrary.Responses;
using InvoiceApi.Application.Interfaces;
using InvoiceApi.Domain.Entities;
using InvoiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace InvoiceApi.Infrastructure.Repositories
{
    public class InvoiceRepository(InvoiceDbContext context) : IInvoice
    {
        public async Task<Response> CreateAsync(Invoice entity)
        {
            try
            {
                // The final number contains the generated Id, so save once with a unique
                // placeholder, then replace it. Result looks like INV-2026-000042.
                entity.InvoiceNumber = $"TMP-{Guid.NewGuid():N}";
                var invoice = context.Invoices.Add(entity).Entity;
                await context.SaveChangesAsync();

                invoice.InvoiceNumber = $"INV-{invoice.IssuedAt:yyyy}-{invoice.Id:D6}";
                await context.SaveChangesAsync();
                return new Response(true, $"Invoice {invoice.InvoiceNumber} created successfully");
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                return new Response(false, "Error occurred while creating the invoice");
            }
        }

        public async Task<Response> UpdateAsync(Invoice entity)
        {
            try
            {
                var exists = await context.Invoices.AsNoTracking().AnyAsync(i => i.Id == entity.Id);
                if (!exists)
                    return new Response(false, "Invoice is not found");

                context.Invoices.Update(entity);
                await context.SaveChangesAsync();
                return new Response(true, $"Invoice {entity.InvoiceNumber} updated successfully");
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                return new Response(false, "Error occurred while updating the invoice");
            }
        }

        public async Task<Response> DeleteAsync(Invoice entity)
        {
            try
            {
                var invoice = await FindByIdAsync(entity.Id);
                if (invoice is null)
                    return new Response(false, "Invoice is not found");

                context.Invoices.Remove(invoice);
                await context.SaveChangesAsync();
                return new Response(true, $"Invoice {invoice.InvoiceNumber} deleted successfully");
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                return new Response(false, "Error occurred while deleting the invoice");
            }
        }

        public async Task<Invoice> FindByIdAsync(int id)
        {
            try
            {
                var invoice = await context.Invoices.FindAsync(id);
                return invoice is not null ? invoice : null!;
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                throw new Exception("Error occurred while retrieving the invoice");
            }
        }

        public async Task<IEnumerable<Invoice>> GetAllAsync()
        {
            try
            {
                return await context.Invoices.AsNoTracking()
                    .OrderByDescending(i => i.IssuedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                throw new Exception("Error occurred while retrieving invoices");
            }
        }

        public async Task<Invoice> GetByAsync(Expression<Func<Invoice, bool>> predicate)
        {
            try
            {
                var invoice = await context.Invoices.AsNoTracking().Where(predicate).FirstOrDefaultAsync();
                return invoice is not null ? invoice : null!;
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                throw new Exception("Error occurred while retrieving the invoice");
            }
        }

        public async Task<IEnumerable<Invoice>> GetInvoicesAsync(Expression<Func<Invoice, bool>> predicate)
        {
            try
            {
                return await context.Invoices.AsNoTracking()
                    .Where(predicate)
                    .OrderByDescending(i => i.IssuedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                throw new Exception("Error occurred while retrieving invoices");
            }
        }
    }
}
