namespace Test2.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;
using SuperLocalizer.Services;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

/// <summary>
/// Controller responsible for handling authentication and login requests.
/// </summary>
[ApiController]
[Route("auth")]
public class LoginController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    /// <summary>
    /// Initializes a new instance of the <see cref="LoginController"/> class.
    /// </summary>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="passwordHasher">The password hasher service.</param>
    /// <param name="userRepository">The user repository.</param>
    public LoginController(IConfiguration configuration, IPasswordHasher passwordHasher, IUserRepository userRepository)
    {
        _configuration = configuration;
        _passwordHasher = passwordHasher;
        _userRepository = userRepository;
    }

    /// <summary>
    /// Authenticates the user and returns a JWT token if credentials are valid.
    /// </summary>
    /// <param name="request">The login request containing username and password.</param>
    /// <returns>An IActionResult containing the JWT token if successful, or Unauthorized if not.</returns>
    [HttpPost("signin")]
    public async Task<IActionResult> Signin([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Username) || request.Password == null)
        {
            return this.Unauthorized();
        }

        // First retrieve the user by username/email
        var user = await this._userRepository.GetByUsername(request.Username);
        if (user == null)
        {
            return this.Unauthorized();
        }

        // Verify the supplied password against the stored password hash
        var verified = this._passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!verified)
        {
            return this.Unauthorized();
        }

        var token = this.GenerateJwtToken(user.Username);
        return this.Ok(new { Token = token });
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] LoginRequest request)
    {
        var user = new User
        {
            Username = request.Username,
            Email = request.Username,
            PasswordHash = request.Password
        };

        var existingUser = await this._userRepository.GetByUsername(user.Username);
        if (existingUser != null)
        {
            return this.BadRequest("Username already exists.");
        }

        user.PasswordHash = this._passwordHasher.HashPassword(user.PasswordHash);
        await this._userRepository.CreateAsync(user);
        return this.Ok("User created successfully.");
    }

    private string GenerateJwtToken(string username)
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
}

/// <summary>
/// Represents a login request with username and password.
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// Gets or sets the username.
    /// </summary>
    public string Username { get; set; }

    /// <summary>
    /// Gets or sets the password.
    /// </summary>
    public string Password { get; set; }
}