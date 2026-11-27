using Microsoft.EntityFrameworkCore;
using OrderApi.Application.Interfaces;
using OrderApi.Domain.Codes;
using OrderApi.Domain.Entities;
using OrderApi.Infrastructure.Data;
using SharedLibrary.Logs;
using SharedLibrary.Responses;
using System.Linq.Expressions;

namespace OrderApi.Infrastructure.Repositories
{
    public class OrderRepository(OrderDbContext context) : IOrder
    {
        public async Task<Response> CreateAsync(Order entity)
        {
            try
            {
                entity.OrderDate = DateTime.UtcNow;
                entity.Status = OrderStatus.Confirmed;
                entity.RedeemedAt = null;
                entity.PickupCode = await NewUniqueCodeAsync();

                var order = context.Orders.Add(entity).Entity;
                await context.SaveChangesAsync();
                return order.Id>0? new Response(true, "Order placed successfully") : 
                    new Response(false, "Error could occured while placing order"); 
            }
            catch(Exception ex)
            {
                // Log origin exception
                LogException.LogExceptions(ex);

                //Display scary free message to client
                return new Response(false, "Error could occur while placing order");
            }
        }

        public async Task<Response> DeleteAsync(Order entity)
        {
            try
            {
                var order = await FindByIdAsync(entity.Id);
                if (order is null)
                    return new Response(false, $"Order {entity.Id} is not found");
                if (order.Status == OrderStatus.Confirmed)
                    return new Response(false, "This order was already redeemed and cannot be cancelled");

                context.Orders.Remove(order);
                await context.SaveChangesAsync();
                return new Response(true, "Order deleted successfully");
            }
            catch (DbUpdateException ex)
            {
                // A foreign key (for example the order's invoice) still points at this order.
                LogException.LogExceptions(ex);
                return new Response(false, "This order cannot be cancelled because other records, such as an invoice, depend on it");
            }
            catch (Exception ex)
            {
                // Log origin exception
                LogException.LogExceptions(ex);

                //Display scary free message to client
                return new Response(false, "Error could occur while deleting order");
            }
        }

        public async Task<Order> FindByIdAsync(int id)
        {
            try
            {
                var order = await context.Orders!.FindAsync(id);
                return order is not null ? order : null!;
            }
            catch (Exception ex)
            {
                // Log origin exception
                LogException.LogExceptions(ex);

                //Display scary free message to client
                throw new Exception("Error occured while retrieving order");
            }
        }
        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            try
            {
                var orders = await context.Orders.AsNoTracking().ToListAsync();
                return orders is not null ? orders : null!;
            }
            catch (Exception ex)
            {
                // Log origin exception
                LogException.LogExceptions(ex);

                //Display scary free message to client
                throw new Exception("Error occured while retrieving orders");
            }
        }
        public async Task<Order> GetByAsync(Expression<Func<Order, bool>> predicate)
        {
            try
            {
                var order = await context.Orders.Where(predicate).FirstOrDefaultAsync();
                return order is not null ? order : null!;
            }
            catch (Exception ex)
            {
                // Log origin exception
                LogException.LogExceptions(ex);

                //Display scary free message to client
                throw new Exception("Error occurred while retrieving order");
            }
        }
        public async Task<IEnumerable<Order>> GetOrdersAsync(Expression<Func<Order, bool>> predicate)
        {
            try
            {
                var orders = await context.Orders.Where(predicate).ToListAsync();
                return orders is not null ? orders : null!;
            }
            catch (Exception ex)
            {
                // Log origin exception
                LogException.LogExceptions(ex);

                //Display scary free message to client
                throw new Exception("Error occurred while retrieving orders");
            }
        }
        public async Task<Response> UpdateAsync(Order entity)
        {
            try
            {
                var order = await FindByIdAsync(entity.Id);
                if(order is null)
                    return new Response(false, "Order is not found");
                if (order.Status == OrderStatus.Confirmed)
                    return new Response(false, $"This order was already {Describe(order.Status)} and cannot be changed");

                // Change only what a customer may edit. The code, status and owner stay as they are.
                // (Replacing the whole row would erase the PickupCode, because the DTO does not carry it.)
                order.ProductId = entity.ProductId;
                order.PurchaseQuantity = entity.PurchaseQuantity;

                // Orders placed before QR codes existed get their code the first time they are saved.
                order.PickupCode ??= await NewUniqueCodeAsync();
                await context.SaveChangesAsync();
                return new Response(true, "Order updated successfully");
            }
            catch (Exception ex)
            {
                // Log origin exception
                LogException.LogExceptions(ex);

                //Display scary free message to client
                return new Response(false, "Error could occured while deleting order");
            }
        }
        // The job starts when a technician scans the customer's QR code.
        public Task<Response> StartAsync(string code, int technicianId) =>
            MoveAsync(code, OrderStatus.Confirmed, OrderStatus.InProgress, technicianId, "Service started");

        // The technician who started the job finishes it (an admin may finish any job).
        public async Task<Response> FinishAsync(int orderId, int callerId, bool isAdmin)
        {
            try
            {
                var changed = await context.Orders
                    .Where(o => o.Id == orderId && o.Status == OrderStatus.InProgress
                                && (isAdmin || o.TechnicianId == callerId))
                    .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, OrderStatus.Done));
                if (changed == 1)
                    return new Response(true, "Service finished. The customer can pay now");

                var existing = await context.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == orderId);
                if (existing is null)
                    return new Response(false, "Order is not found");
                if (existing.Status == OrderStatus.InProgress)
                    return new Response(false, "Only the technician who started this job can finish it");
                return new Response(false, $"This order is {Describe(existing.Status)}, so it cannot be finished");
            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                return new Response(false, "Error occured while finishing the order");
            }
        }
        // The admin takes the payment and closes the order. Only a finished job can be redeemed.
        public Task<Response> RedeemAsync(string code) =>
            MoveAsync(code, OrderStatus.Done, OrderStatus.Redeemed, null, "Payment taken, order closed");
        private async Task<Response> MoveAsync(
            string code, OrderStatus from, OrderStatus to, int? technicianId, string success)
        {
            try
            {
                code = PickupCode.Normalize(code);
                if (code.Length != PickupCode.Length)
                    return new Response(false, "This is not a valid pickup code");
                var now = DateTime.UtcNow;
                var waiting = context.Orders.Where(o => o.PickupCode == code && o.Status == from);
                var changed = to switch
                {
                    OrderStatus.InProgress => await waiting.ExecuteUpdateAsync(s => s
                        .SetProperty(o => o.Status, OrderStatus.InProgress)
                        .SetProperty(o => o.TechnicianId, technicianId)),
                    OrderStatus.Redeemed => await waiting.ExecuteUpdateAsync(s => s
                        .SetProperty(o => o.Status, OrderStatus.Redeemed)
                        .SetProperty(o => o.RedeemedAt, now)),
                    _ => 0
                };
                if (changed == 1)
                    return new Response(true, success);

                // Nothing changed: either the code does not exist or it was used before.
                var existing = await context.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.PickupCode == code);
                return existing is null
                    ? new Response(false, "No order has this code")
                    : new Response(false, $"This order is {Describe(existing.Status)}, so it cannot move to {Describe(to)}");

            }
            catch (Exception ex)
            {
                LogException.LogExceptions(ex);
                return new Response(false, "Error occured while redeeming the order");
            }
        }
        private static string Describe(OrderStatus status) => status switch
        {
            OrderStatus.Confirmed => "booked",
            OrderStatus.InProgress => "in progress",
            OrderStatus.Done => "finished and waiting for payment",
            _ => "paid and closed"
        };
        ///Random code that no other order has. A clash is very unlikely, so a few tries is plenty.
        private async Task<string> NewUniqueCodeAsync()
        {
            for (var attempt = 0; attempt < 5; attempt++)
            {
                var code = PickupCode.Generate();
                if (!await context.Orders.AnyAsync(o => o.PickupCode == code))
                    return code;
            }
            throw new InvalidOperationException("Could not generate a unique pickup code.");
        }

    }
}
