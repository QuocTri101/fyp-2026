using ProductApi.Domain.Entities;

namespace ProductApi.Application.DTOs.Conversions
{
    public static class ProductConversion
    {
        public static Product ToEntity(ProductDTO product) => new()
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            Quantity = product.Quantity,
            Barcode = string.IsNullOrWhiteSpace(product.Barcode) ? null : product.Barcode.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(product.ImageUrl) ? null : product.ImageUrl
        };

        public static (ProductDTO?, IEnumerable<ProductDTO>?) FromEntity(Product product, IEnumerable<Product>? products)
        {
            //return single
            if(product is not null || products is null)
            {
                var singleProduct = new ProductDTO(
                    product!.Id,
                    product.Name!,
                    product.Quantity,
                    product.Price,
                    product.Barcode,
                    product.ImageUrl);
                return (singleProduct, null);
            }
            //return list
            if (products is not null || product is null)
            {
                var _products = products!.Select(p => 
                    new ProductDTO(
                        p.Id,
                        p.Name!,
                        p.Quantity,
                        p.Price,
                        p.Barcode,
                        p.ImageUrl)).ToList();
                return (null, _products);
            }
            return(null, null);
        }
    }
}
