
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
public class AccountController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUserProfile _userProfile;
    private readonly IInvitationService _invitationService;

    /// <summary>
    /// Initializes a new instance of the <see cref="AccountController"/> class.
    /// </summary>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="passwordHasher">The password hasher service.</param>
    /// <param name="userRepository">The user repository.</param>
    /// <param name="userProfile">The user profile service.</param>
    /// <param name="invitationService">The invitation service.</param>
    public AccountController(
        IConfiguration configuration,
        IPasswordHasher passwordHasher,
        IUserRepository userRepository,
        IUserProfile userProfile,
        IInvitationService invitationService)
    {
        _configuration = configuration;
        _passwordHasher = passwordHasher;
        _userRepository = userRepository;
        _userProfile = userProfile;
        _invitationService = invitationService;
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

        var token = await _userProfile.GenerateJwtToken(user.Username);
        return Ok(new LoginResponse
        {
            Token = token,
        });
    }

    /// <summary>
    /// Registers a new user with the provided credentials.
    /// </summary>
    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] LoginRequest request, [FromQuery] string invitationToken)
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

        if (!string.IsNullOrEmpty(invitationToken))
        {
            var invitation = await this._invitationService.GetInvitationByTokenAsync(invitationToken);
            if (invitation == null)
            {
                return this.BadRequest("Invalid invitation token.");
            }
            user.CompanyId = invitation.CompanyId;
            user.CompanyName = invitation.CompanyName;
            user.MainProjectId = invitation.MainProjectId;
            user.MainProjectName = invitation.MainProjectName;
        }

        await this._userRepository.Create(user);
        return this.Ok("User created successfully.");
    }

    /// <summary>
    /// Creates an invitation for the current user.
    /// </summary>
    [HttpPost("create/invitation")]
    public async Task<IActionResult> CreateInvitation()
    {
        var current = await _userProfile.GetCurrentUser();
        var token = await this._invitationService.CreateInvitationAsync((User)current);
        return this.Ok(new { token = token, message = "Invitation created successfully." });
    }

    /// <summary>
    /// Handles social login (Google OAuth) by creating or retrieving user and returning JWT token.
    /// </summary>
    /// <param name="request">The social login request containing Google user info.</param>
    /// <returns>An IActionResult containing the JWT token and user info.</returns>
    [HttpPost("social-signin")]
    public async Task<IActionResult> SocialLogin([FromBody] SocialLoginRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Email))
        {
            return BadRequest("Invalid social login request");
        }

        // Check if user exists by email
        var existingUser = await _userRepository.GetByUsername(request.Email);

        if (existingUser == null)
        {
            // Create new user from social login
            var newUser = new User
            {
                Username = request.Email,
                Email = request.Email,
                // No password hash for social login users
                PasswordHash = null,
                // You might want to add additional fields for social login
                // SocialProvider = "google",
                // SocialId = request.Id
            };

            await _userRepository.Create(newUser);
            existingUser = newUser;
        }

        var token = _userProfile.GenerateJwtToken(existingUser.Username);

        return Ok(new LoginResponse
        {
            Token = await token,
        });
    }

    /// <summary>
    /// Gets the currently authenticated user's profile.
    /// </summary>
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
}

/// <summary>
/// Represents a social login request from OAuth providers like Google.
/// </summary>
public class SocialLoginRequest
{
    /// <summary>
    /// Gets or sets the user's email from the OAuth provider.
    /// </summary>
    public string Email { get; set; }

    /// <summary>
    /// Gets or sets the user's name from the OAuth provider.
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the OAuth provider (e.g., "google").
    /// </summary>
    public string Provider { get; set; }

    /// <summary>
    /// Gets or sets the user's ID from the OAuth provider.
    /// </summary>
    public string ProviderId { get; set; }
}