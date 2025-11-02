using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace SuperLocalizer.Services;

public interface IPasswordHasher
{
    // Produces a string containing the iterations, salt and hash (format: iterations.salt.hash)
    string HashPassword(string password);

    // Verifies a password against the stored representation
    bool VerifyPassword(string password, string passwordHash);
}

public class PasswordHasher : IPasswordHasher
{
    private readonly IConfiguration _configuration;
    private readonly int _iterations;
    private readonly int _saltSize;
    private readonly int _keySize;
    private readonly string _pepper;

    public PasswordHasher(IConfiguration configuration)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));

        // Read settings from configuration with sensible defaults.
        _iterations = _configuration.GetValue<int?>("PasswordHashing:Iterations") ?? 100_000;
        _saltSize = _configuration.GetValue<int?>("PasswordHashing:SaltSize") ?? 16; // bytes
        _keySize = _configuration.GetValue<int?>("PasswordHashing:KeySize") ?? 32; // bytes
        _pepper = _configuration["PasswordHashing:Pepper"] ?? string.Empty;
    }

    public string HashPassword(string password)
    {
        if (password is null) throw new ArgumentNullException(nameof(password));

        // Generate a per-password random salt
        var salt = new byte[_saltSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Combine pepper and password (pepper is optional application-level secret)
        var passwordBytes = Encoding.UTF8.GetBytes(password + _pepper);

        // Derive the key using PBKDF2 (Rfc2898) with HMACSHA256
        byte[] key;
        using (var deriveBytes = new Rfc2898DeriveBytes(passwordBytes, salt, _iterations, HashAlgorithmName.SHA256))
        {
            key = deriveBytes.GetBytes(_keySize);
        }

        // Store as iterations.saltBase64.keyBase64
        var saltB64 = Convert.ToBase64String(salt);
        var keyB64 = Convert.ToBase64String(key);
        return $"{_iterations}.{saltB64}.{keyB64}";
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        if (password is null) throw new ArgumentNullException(nameof(password));
        if (passwordHash is null) return false;

        // Expected format: iterations.salt.hash
        var parts = passwordHash.Split('.');
        if (parts.Length != 3) return false;

        if (!int.TryParse(parts[0], out var iterations)) return false;
        byte[] salt, expectedKey;
        try
        {
            salt = Convert.FromBase64String(parts[1]);
            expectedKey = Convert.FromBase64String(parts[2]);
        }
        catch
        {
            return false;
        }

        var passwordBytes = Encoding.UTF8.GetBytes(password + _pepper);

        byte[] actualKey;
        using (var deriveBytes = new Rfc2898DeriveBytes(passwordBytes, salt, iterations, HashAlgorithmName.SHA256))
        {
            actualKey = deriveBytes.GetBytes(expectedKey.Length);
        }

        return FixedTimeEquals(actualKey, expectedKey);
    }

    // Constant-time comparison to avoid timing attacks
    private static bool FixedTimeEquals(byte[] a, byte[] b)
    {
        if (a == null || b == null) return false;
        if (a.Length != b.Length) return false;

        var diff = 0;
        for (int i = 0; i < a.Length; i++)
        {
            diff |= a[i] ^ b[i];
        }

        return diff == 0;
    }
}