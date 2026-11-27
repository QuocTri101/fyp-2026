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
        "Barcode must be 8 to 14 digits.")] string? Barcode = null,
     [MaxLength(600_000, ErrorMessage = "The image is too large.")]
     [RegularExpression(@"^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$",
        ErrorMessage = "The image must be a PNG, JPEG or WebP.")] string? ImageUrl = null
    );
}
