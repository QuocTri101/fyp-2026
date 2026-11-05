using Microsoft.Identity.Client;
using OrderApi.Application.DTOs;
using OrderApi.Application.Interfaces;
using Polly;
using Polly.Registry;
using System.Net.Http.Json;
namespace OrderApi.Application.Services
{
    public class OrderService(IOrder orderInterface, HttpClient httpClient,
        ResiliencePipelineProvider<string> resiliencePipeline) : IOrderService
    {
        //Get Product
        public async Task<ProductDTO> GetProduct(int productId)
        {
            //Call Product Api using Http Client
            //Redirect this call to the API gateway, not response to outsider
            var getProduct = await httpClient.GetAsync($"/api/products/{productId}");
            if (!getProduct.IsSuccessStatusCode)
                return null;
            var product = await getProduct.Content.ReadFromJsonAsync<ProductDTO>();
            return product!;
        }

        //Get User
        public async Task<AppUserDTO> GetUser(int userId)
        {
            //Call User Api using Http Client
            //Redirect this call to the API gateway, not response to outsider
            var getUser = await httpClient.GetAsync($"/api/products/{userId}");
            if (!getUser.IsSuccessStatusCode)
                return null;
            var product = await getUser.Content.ReadFromJsonAsync<AppUserDTO>();
            return product!;
        }
        //Get Order Details
        public async Task<OrderDetailDTO> GetOrderDetails(int orderId)
        {
            //Prepare Order
            var order = await orderInterface.FindByIdAsync(orderId);
            if (order is null || order!.Id <=0)
                return null;
            //Get Retry pipeline
            var retryPipeline = resiliencePipeline.GetPipeline("my-retry-pipeline");

            //Prepare Product
            var productDTO = await retryPipeline.ExecuteAsync(async token => await GetProduct(order.ProductId));

            //Prepare Client
            var appUserDTO = await retryPipeline.ExecuteAsync(async token => await GetUser(order.ClientId));
            //Populate Order Details
            return new OrderDetailDTO(
                order.Id,
                productDTO.Id,
                appUserDTO.Id,
                appUserDTO.Name,
                appUserDTO.Email,
                appUserDTO.Address,
                appUserDTO.PhoneNumber,
                productDTO.Name,
                order.PurchaseQuantity,
                productDTO.Price,
                productDTO.Quantity * order.PurchaseQuantity,
                order.OrderDate
            );
        }

        //Get Orders by Client Id
        public async Task<IEnumerable<OrderDTO>> GetOrdersByClientId(int clientId)
        {
            //Get all Client Orders
            var orders = await orderInterface.GetOrdersByClientId(o => o.ClientId == clientId);
            if (!orders.Any())
                return null!;
            //Convert to DTO
            var (_, _orders) = OrderConversion.FromEntity(null, orders);
            return _orders!;
        }
        public Task<OrderDetailDTO> GetOrderDetails(int orderId)
        {
            throw new NotImplementedException();
        }
        public Task<IEnumerable<OrderDTO>> GetOrdersByClientIdAsync(int clientId)
        {
            throw new NotImplementedException();
        }
    }
}
