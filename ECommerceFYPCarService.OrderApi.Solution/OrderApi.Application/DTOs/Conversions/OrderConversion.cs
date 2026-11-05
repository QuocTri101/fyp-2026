using OrderApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace OrderApi.Application.DTOs.Conversions
{
    public static class OrderConversion
    {
        public static Order ToEntity(OrderDTO order) => new Order()
        {
            Id = order.Id,
            ClientId = order.ClientId,
            ProductId = order.ProductId,
            OrderDate = order.OrderDate,
            PurchaseQuantity = order.PurchaseQuantity
        };

        public static (OrderDTO?, IEnumerable<OrderDTO>?) FromEntity(Order? order, IEnumerable<Order>? orders)
        {
            //return single
            if order is not null || orders is null
            {
                var singleOrder = new OrderDTO(
                    order!.Id,
                    order.ClientId,
                    order.ProductId,
                    order.OrderDate,
                    order.PurchaseQuantity);
                return (singleOrder, null);
            }
            //return list
            if(orders is not null || order is null)
            {
                var _orders = orders!.Select(o => 
                new OrderDTO(
                    o.Id,
                    o.ClientId,
                    o.ProductId,
                    o.OrderDate,
                    o.PurchaseQuantity));
                return (null,_orders);
            }
        }
    }
}
