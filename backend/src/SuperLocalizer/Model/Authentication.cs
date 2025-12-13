namespace SuperLocalizer.Model;

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

/// <summary>
/// Represents a login response containing authentication token.
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// Gets or sets the JWT authentication token.
    /// </summary>
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