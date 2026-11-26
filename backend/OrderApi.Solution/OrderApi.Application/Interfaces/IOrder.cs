using SharedLibrary.Interface;
using OrderApi.Domain.Entities;
using System.Linq.Expressions;
using SharedLibrary.Responses;
namespace OrderApi.Application.Interfaces
{
    public interface IOrder:IGenericInterface<Order>
    {
        Task<IEnumerable<Order>> GetOrdersAsync(Expression<Func<Order, bool>> predicate);
        Task<Response> RedeemAsync(string code);
    }
}
