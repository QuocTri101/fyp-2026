using System.ComponentModel.DataAnnotations;

namespace OrderApi.Application.DTOs
{
    public record RedeemRequestDTO([Required] string Code);
}
