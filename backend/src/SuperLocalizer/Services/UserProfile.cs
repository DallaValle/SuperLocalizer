using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using SuperLocalizer.Repository;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Configuration;
using SuperLocalizer.Model;

namespace SuperLocalizer.Services;

public interface IUserProfile
{
    Task<CurrentUser> GetCurrentUser();
    string GenerateJwtToken(string username);
}

public class UserProfile : IUserProfile
{
    private readonly HttpContext _httpContext;
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public UserProfile(IHttpContextAccessor httpContextAccessor, IUserRepository userRepository, IConfiguration configuration)
    {
        _httpContext = httpContextAccessor.HttpContext ?? throw new ArgumentNullException(nameof(httpContextAccessor), "HttpContext cannot be null");
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public string GenerateJwtToken(string username)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(this._configuration["Jwt:Key"] ?? "supersecretkey12345678901234567890123456789"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: this._configuration["Jwt:Issuer"] ?? "MyIssuer",
            audience: this._configuration["Jwt:Audience"] ?? "MyAudience",
            claims: claims,
            expires: DateTime.Now.AddMinutes(int.TryParse(this._configuration["Jwt:ExpireMinutes"], out var minutes) ? minutes : 60),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Gets the current user from the JWT token / ClaimsPrincipal attached to the HttpContext
    /// </summary>
    public async Task<CurrentUser> GetCurrentUser()
    {
        var user = _httpContext?.User;
        if (user == null || user.Identity == null || !user.Identity.IsAuthenticated)
            throw new InvalidOperationException("No authenticated user found in the current context.");

        var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? user.FindFirst("sub")?.Value
                       ?? string.Empty;

        var dbUser = await _userRepository.GetByUsername(username);
        if (dbUser == null) return null;
        return new CurrentUser
        {
            Id = dbUser.Id,
            Username = dbUser.Username,
            CompanyId = dbUser.CompanyId,
            CompanyName = dbUser.CompanyName,
            MainProjectId = dbUser.MainProjectId,
            MainProjectName = dbUser.MainProjectName,
        };
    }
}