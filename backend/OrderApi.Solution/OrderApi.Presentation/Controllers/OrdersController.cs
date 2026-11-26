using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderApi.Application.DTOs;
using OrderApi.Application.DTOs.Conversions;
using OrderApi.Application.Interfaces;
using OrderApi.Application.Services;
using OrderApi.Domain.Codes;
using SharedLibrary.Responses;
using System.Security.Claims;

namespace OrderApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController(IOrder orderInterface, IOrderService orderService) : ControllerBase
    {
        private const string StaffRoles = "Admin,Technician";
        // A pickup code is like cash: whoever shows it gets the service. So customers may only
        // see and change their own orders, and only staff can list everything or redeem.
        private bool IsStaff => User.IsInRole("Admin") || User.IsInRole("Technician");

        private int? CurrentUserId =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

        private bool CanAccess(int clientId) => IsStaff || CurrentUserId == clientId;

        [HttpGet]
        [Authorize(Roles = StaffRoles)]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrders()
        {
            var orders = await orderInterface.GetAllAsync();
            if (!orders.Any())
                return NotFound("No orders found.");
            var (_, list) = OrderConversion.FromEntity(null, orders);
            return !list!.Any() ? NotFound() : Ok(list);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDTO>> GetOrder(int id)
        {
            var order = await orderInterface.FindByIdAsync(id);
            if (order is null)
                return NotFound(null);
            if (!CanAccess(order.ClientId))
                return Forbid();

            var (_orderDTO, _) = OrderConversion.FromEntity(order, null);
            return Ok(order);
        }

        [HttpGet("client/{clientId:int}")]
        public async Task<ActionResult<OrderDTO>> GetClientOrders(int clientId)
        {
            if (clientId <= 0)
                return BadRequest("Invalid client ID.");
            if (!CanAccess(clientId))
                return Forbid();

            var orders = await orderInterface.GetOrdersAsync(o => o.ClientId == clientId);
            if (!orders.Any())
                return NotFound("No orders found.");
            var (_, list) = OrderConversion.FromEntity(null, orders);
            return Ok(list);
        }

        [HttpGet("code/{code}")]
        [Authorize(Roles = StaffRoles)]
        public async Task<ActionResult<OrderDTO>> GetOrderByCode(string code)
        {
            code = PickupCode.Normalize(code);
            if (code.Length != PickupCode.Length)
                return BadRequest("This is not a valid pickup code.");

            var order = await orderInterface.GetByAsync(o => o.PickupCode == code);
            if (order is null)
                return NotFound("No order has this code.");

            var (orderDto, _) = OrderConversion.FromEntity(order, null);
            return Ok(orderDto);
        }

        [HttpPost]
        public async Task<ActionResult<Response>> CreateOrder(OrderDTO orderDTO)
        {
            //Check model state if all data annotations are valid
            if (!ModelState.IsValid)
                return BadRequest("Invalid product data.");
            if (!CanAccess(orderDTO.ClientId))
                return Forbid();
            //Convert to entity
            var getEntity = OrderConversion.ToEntity(orderDTO);
            var response = await orderInterface.CreateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut]
        public async Task<ActionResult<Response>> UpdateOrder(OrderDTO orderDTO)
        {
            //Convert DTO to entity
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check the stored owner, not the ClientId in the request body.
            var existing = await orderInterface.FindByIdAsync(orderDTO.Id);
            if (existing is null)
                return NotFound(new Response(false, "Order is not found"));
            if (!CanAccess(existing.ClientId))
                return Forbid();
            var order = OrderConversion.ToEntity(orderDTO);
            var response = await orderInterface.UpdateAsync(order);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpDelete]
        public async Task<ActionResult<Response>> DeleteOrder(OrderDTO orderDTO)
        {
            var existing = await orderInterface.FindByIdAsync(orderDTO.Id);
            if (existing is null)
                return NotFound(new Response(false, "Order is not found"));
            if (!CanAccess(existing.ClientId))
                return Forbid();
            //Convert DTO to entity
            var order = OrderConversion.ToEntity(orderDTO);
            var response = await orderInterface.DeleteAsync(order);
            return response.Flag ? Ok(response) : BadRequest(response);
        }
        //Staff confirm the customer got the service.Works once per code.
        [HttpPost("redeem")]
        [Authorize(Roles = StaffRoles)]
        public async Task<ActionResult<Response>> Redeem(RedeemRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await orderInterface.RedeemAsync(request.Code);
            return response.Flag ? Ok(response) : BadRequest(response);
        }
    }
}
