using OrderApi.Domain.Entities;

namespace OrderApi.Application.DTOs.Conversions
{
    public static class OrderConversion
    {
        public static Order ToEntity(OrderDTO order) => new ()
        {
            Id = order.Id,
            ClientId = order.ClientId,
            ProductId = order.ProductId,
            OrderDate = order.OrderDate,
            PurchaseQuantity = order.PurchaseQuantity
        };

        private static OrderDTO ToDto(Order o) => new(
            o.Id,
            o.ProductId,
            o.ClientId,
            o.PurchaseQuantity,
            o.OrderDate,
            o.PickupCode,
            o.Status.ToString(),
            o.RedeemedAt);

        public static (OrderDTO?, IEnumerable<OrderDTO>?) FromEntity(Order? order, IEnumerable<Order>? orders)
        {
            //return single
            if (order is not null || orders is null)
                return (ToDto(order!), null);

            //return list
            return (null, orders.Select(ToDto).ToList());
        }
    }
}
