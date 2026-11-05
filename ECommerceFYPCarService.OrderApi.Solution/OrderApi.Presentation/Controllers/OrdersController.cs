using eCommerceCar.SharedLibrary.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OrderApi.Application.DTOs;
using OrderApi.Application.DTOs.Conversions;
using OrderApi.Application.Interfaces;
using OrderApi.Application.Services;

namespace OrderApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController(IOrder orderInterface, IOrderService orderService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrders()
        {
            var orders = await orderInterface.GetAllAsync();
            if (!orders.Any())
                return NotFound("No orders found.");
            var (_, list) = OrderConversion.FromEntity(null, orders);
            return !list!.Any() ? NotFound() : Ok(list);
        }

        [HttpGet]
        public async Task<ActionResult<Response>> CreateOrder(OrderDTO orderDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid product data.");
        }
    }
}
