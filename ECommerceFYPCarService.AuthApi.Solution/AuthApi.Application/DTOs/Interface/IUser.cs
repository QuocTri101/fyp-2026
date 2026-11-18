using eCommerceCar.SharedLibrary.Responses;

namespace AuthApi.Application.DTOs.Interface
{
    public interface IUser
    {
        Task<Response> Register(AppUserDTO appUserDTO);
        Task<Response> Login(LoginDTO loginDTO);
        Task<GetUserDTO> GetUser(int userId);
    }
}
