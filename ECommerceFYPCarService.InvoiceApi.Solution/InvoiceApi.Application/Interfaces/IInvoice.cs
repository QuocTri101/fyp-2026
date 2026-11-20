using eCommerceCar.SharedLibrary.Interface;
using InvoiceApi.Domain.Entities;
using System.Linq.Expressions;

namespace InvoiceApi.Application.Interfaces
{
    public interface IInvoice : IGenericInterface<Invoice>
    {
        Task<IEnumerable<Invoice>> GetInvoicesAsync(Expression<Func<Invoice, bool>> predicate);
    }
}
