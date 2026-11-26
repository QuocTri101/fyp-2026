using System.ComponentModel.DataAnnotations;

namespace ProductApi.Application.DTOs
{
    public record ProductDTO
    (
     int Id,
     [Required] string Name,
     [Required, Range(1, int.MaxValue)] int Quantity,
     [Required, DataType(DataType.Currency)] decimal Price,
     [RegularExpression(@"^\d{8,14}$", ErrorMessage = 
        "Barcode must be 8 to 14 digits.")] string? Barcode = null
    );
}
