
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using SuperLocalizer.Model;
using SuperLocalizer.Repository;
using SuperLocalizer.Services;
using System.Threading.Tasks;

namespace Test2.Api.Controllers;
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
    private readonly IUserProfile _userProfile;

    /// <summary>
    /// Initializes a new instance of the <see cref="LoginController"/> class.
    /// </summary>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="passwordHasher">The password hasher service.</param>
    /// <param name="userRepository">The user repository.</param>
    /// <param name="userProfile">The user profile service.</param>
    public LoginController(IConfiguration configuration, IPasswordHasher passwordHasher, IUserRepository userRepository, IUserProfile userProfile)
    {
        _configuration = configuration;
        _passwordHasher = passwordHasher;
        _userRepository = userRepository;
        _userProfile = userProfile;
    }

    /// <summary>
    /// Authenticates the user and returns a JWT token if credentials are valid.
    /// </summary>
    /// <param name="request">The login request containing username and password.</param>
    /// <returns>An IActionResult containing the JWT token if successful, or Unauthorized if not.</returns>
    [HttpPost("signin")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
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

        var token = _userProfile.GenerateJwtToken(user.Username);
        return Ok(new LoginResponse
        {
            Token = token,
            User = null,
        });
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

    [HttpGet("user")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var currentUser = await _userProfile.GetCurrentUser();
        if (currentUser == null)
            return Unauthorized("Invalid token");

        return Ok(currentUser);
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

public class LoginResponse
{
    public string Token { get; set; }
    public CurrentUser User { get; set; }
}