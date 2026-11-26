using Microsoft.EntityFrameworkCore;
using ProductApi.Application.Interfaces;
using ProductApi.Domain.Barcodes;
using ProductApi.Domain.Entities;
using ProductApi.Infrastructure.Data;
using SharedLibrary.Logs;
using SharedLibrary.Responses;
using System.Linq.Expressions;

namespace ProductApi.Infrastructure.Repositories
{
    internal class ProductRepository(ProductDbContext context) : IProduct
    {
        public async Task<Response> CreateAsync(Product entity)
        {
            try
            {
                //check if the product is ready
                var getProduct = await GetByAsync(_ => _.Name!.Equals(entity.Name));
                if (getProduct is not null && !string.IsNullOrEmpty(getProduct.Name))
                    return new Response(false, $"{entity.Name} already added");

                //a barcode typed or scanned by the admin must not belong to another product
                if (!string.IsNullOrEmpty(entity.Barcode)
                    && await context.Products.AnyAsync(p => p.Barcode == entity.Barcode))
                    return new Response(false, $"Barcode {entity.Barcode} is already used by another product");

                var currentEntity = context.Products.Add(entity).Entity;
                await context.SaveChangesAsync();
                //no barcode given: build one from the new id (needs the id, so it is a second save)
                if (currentEntity.Id > 0 && string.IsNullOrEmpty(currentEntity.Barcode))
                {
                    currentEntity.Barcode = Ean13.FromId(currentEntity.Id);
                    await context.SaveChangesAsync();
                }
                if (currentEntity is not null && currentEntity.Id > 0)
                    return new Response(true, $"{entity.Name} added successfully");
                else
                    return new Response(false, $"Error occured while adding {entity.Name}");
            }
            catch (Exception ex)
            {
                //log the og exception
                LogException.LogExceptions(ex);
                //Display scary-free message to the client
                return new Response(false, "Error occured while adding the product");
            }
        }

        public async Task<Response> DeleteAsync(Product entity)
        {
            try
            {
                var product = await FindByIdAsync(entity.Id);
                if (product is null)
                    return new Response(false, $"{entity.Name} not found");

                context.Products.Remove(product);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.Name} deleted successfully");
            }
            catch (Exception ex)
            {
                //log the og exception
                LogException.LogExceptions(ex);
                //Display scary-free message to the client
                return new Response(false, "Error occured while deleting the product");
            }
        }

        public async Task<Product> FindByIdAsync(int id)
        {
            try
            {
                var product = await context.Products.FindAsync(id);
                return product is not null ? product : null!;

            }
            catch (Exception ex)
            {
                //log the og exception
                LogException.LogExceptions(ex);
                //Display scary-free message to the client
                throw new Exception("Error occured while retrieving product");
            }
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            try
            {
                var products = await context.Products.AsNoTracking().ToListAsync();
                return products is not null ? products : null!;
            }
            catch (Exception ex)
            {
                //log the og exception
                LogException.LogExceptions(ex);
                //Display scary-free message to the client
                throw new InvalidOperationException("Error occured while retrieving products");
            }
        }

        public async Task<Product> GetByAsync(Expression<Func<Product, bool>> predicate)
        {
            try
            {
                var product = await context.Products.Where(predicate).FirstOrDefaultAsync()!;
                return product is not null ? product : null!;
            }
            catch (Exception ex)
            {
                //log the og exception
                LogException.LogExceptions(ex);
                //Display scary-free message to the client
                throw new InvalidOperationException("Error occured while retrieving product");
            }
        }

        public async Task<Response> UpdateAsync(Product entity)
        {
            try
            {
                var product = await FindByIdAsync(entity.Id);
                if (product is null)
                    return new Response(false, $"{entity.Name} not found");
                //products created before barcodes existed get theirs the first time they are saved
                if (string.IsNullOrEmpty(entity.Barcode))
                    entity.Barcode = product.Barcode ?? Ean13.FromId(entity.Id);

                if (await context.Products.AnyAsync(p => p.Barcode == entity.Barcode && p.Id != entity.Id))
                    return new Response(false, $"Barcode {entity.Barcode} is already used by another product");
                context.Entry(product).State = EntityState.Detached;
                context.Products.Update(entity);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.Name} updated successfully");
            }
            catch (Exception ex)
            {
                //log the og exception
                LogException.LogExceptions(ex);
                //Display scary-free message to the client
                return new Response(false,"Error occured while updating existing product");
            }
        }
    }
}
