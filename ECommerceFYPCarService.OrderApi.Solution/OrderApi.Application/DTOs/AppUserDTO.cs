using System.ComponentModel.DataAnnotations;

namespace OrderApi.Application.DTOs
{
    public record AppUserDTO(
        int Id,
        [Required] string Name,
        [Required] string Phone Number,
        [Required] string Address,
        [Required, EmailAddress] string Email,
        [Required] string Password,
        [Required] string Role
        );    
}
