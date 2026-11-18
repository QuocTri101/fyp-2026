using System.ComponentModel.DataAnnotations;

namespace AuthApi.Application.DTOs
{
    public record AppUserDTO
       (
        int Id,
        [Required] string Name,
        [Required] string PhoneNumber,
        [Required] string Address,
        [Required, EmailAddress] string Email,
        [Required] string Password,
        [Required] string Role
        );
    
}
