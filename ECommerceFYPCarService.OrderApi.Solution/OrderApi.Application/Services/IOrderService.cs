using OrderApi.Application.DTOs;

namespace OrderApi.Application.Services
{
    public interface IOrderService
    {
        Task<IEnumerable<OrderDTO>> GetOrdersByClientIdAsync(int clientId);
        Task<OrderDetailDTO> GetOrderDetails(int orderId);
    }
}
