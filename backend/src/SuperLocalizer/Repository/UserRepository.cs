using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using SuperLocalizer.Model;

namespace SuperLocalizer.Repository;

public interface IUserRepository
{
    Task<User> GetByIdAsync(int id);
    Task<User> GetByUsername(string username);
    Task<User> GetByUserAndPasswordAsync(string username, string passwordHash);
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> CreateAsync(User user);
    Task<User> PartialUpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    public async Task<User> GetByIdAsync(int id)
    {
        const string query = @"
            SELECT Id, Username, Email, PasswordHash, CompanyId
            FROM `User`
            WHERE Id = @Id";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);

        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return MapToUser(reader);
        }

        return null;
    }

    public async Task<User> GetByUsername(string username)
    {
        const string query = @"
            SELECT Id, Username, Email, PasswordHash, CompanyId
            FROM `User`
            WHERE Username = @Username OR Email = @Username
            LIMIT 1";
        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Username", username ?? string.Empty);
        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return MapToUser(reader);
        }
        return null;
    }

    public async Task<User> GetByUserAndPasswordAsync(string username, string passwordHash)
    {
        const string query = @"
            SELECT Id, Username, Email, PasswordHash, CompanyId
            FROM `User`
            WHERE (Username = @Username OR Email = @Username)
            AND PasswordHash = @PasswordHash
            LIMIT 1";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@Username", username ?? string.Empty);
        command.Parameters.AddWithValue("@PasswordHash", passwordHash ?? string.Empty);

        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return MapToUser(reader);
        }

        return null;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        const string query = @"
            SELECT Id, Username, Email, PasswordHash, CompanyId
            FROM `User`
            ORDER BY Username";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);

        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();

        var users = new List<User>();
        while (await reader.ReadAsync())
        {
            users.Add(MapToUser(reader));
        }

        return users;
    }

    public async Task<User> CreateAsync(User user)
    {
        const string query = @"
            INSERT INTO `User` (Username, Email, PasswordHash, CompanyId)
            VALUES (@Username, @Email, @PasswordHash, @CompanyId);
            SELECT LAST_INSERT_ID();";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);

        // Map parameters according to User model
        command.Parameters.AddWithValue("@Username", user.Username ?? string.Empty);
        command.Parameters.AddWithValue("@Email", user.Email ?? string.Empty);
        command.Parameters.AddWithValue("@PasswordHash", user.PasswordHash ?? string.Empty);
        command.Parameters.AddWithValue("@CompanyId", user.CompanyId);

        await connection.OpenAsync();
        var newId = Convert.ToInt32(await command.ExecuteScalarAsync());

        user.Id = newId;
        // Created user gets assigned new Id. No InsertDate/UpdateDate on model.
        user.Id = newId;

        return user;
    }

    public async Task<User> PartialUpdateAsync(User user)
    {
        // Build a partial update query: only set columns for properties that are not null.
        var setClauses = new List<string>();
        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand();
        command.Connection = connection;

        // Id is required for the WHERE clause
        command.Parameters.AddWithValue("@Id", user.Id);

        if (user.Username != null)
        {
            setClauses.Add("Username = @Username");
            command.Parameters.AddWithValue("@Username", user.Username);
        }

        if (user.Email != null)
        {
            setClauses.Add("Email = @Email");
            command.Parameters.AddWithValue("@Email", user.Email);
        }

        if (user.PasswordHash != null)
        {
            setClauses.Add("PasswordHash = @PasswordHash");
            command.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
        }

        // Nullable ints: distinguish between 'not provided' (null) and provided value (even if 0)
        if (user.CompanyId.HasValue)
        {
            setClauses.Add("CompanyId = @CompanyId");
            command.Parameters.AddWithValue("@CompanyId", user.CompanyId.Value);
        }

        if (user.CompanyName != null)
        {
            setClauses.Add("CompanyName = @CompanyName");
            command.Parameters.AddWithValue("@CompanyName", user.CompanyName);
        }

        if (user.MainProjectId.HasValue)
        {
            setClauses.Add("MainProjectId = @MainProjectId");
            command.Parameters.AddWithValue("@MainProjectId", user.MainProjectId.Value);
        }

        if (user.MainProjectName != null)
        {
            setClauses.Add("MainProjectName = @MainProjectName");
            command.Parameters.AddWithValue("@MainProjectName", user.MainProjectName);
        }

        if (setClauses.Count == 0)
        {
            // Nothing to update
            return await GetByIdAsync(user.Id);
        }

        var query = $"UPDATE `User` SET {string.Join(", ", setClauses)} WHERE Id = @Id";
        command.CommandText = query;

        await connection.OpenAsync();
        var rowsAffected = await command.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            return null;
        }

        // Return the current state of the user from DB
        return await GetByIdAsync(user.Id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string query = "DELETE FROM `User` WHERE Id = @Id";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);

        await connection.OpenAsync();
        var rowsAffected = await command.ExecuteNonQueryAsync();

        return rowsAffected > 0;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        const string query = "SELECT COUNT(1) FROM `User` WHERE Id = @Id";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);

        await connection.OpenAsync();
        var count = Convert.ToInt32(await command.ExecuteScalarAsync());

        return count > 0;
    }

    private static User MapToUser(IDataReader reader)
    {
        // Use ordinals once and guard against DB NULLs to avoid exceptions
        var idOrd = reader.GetOrdinal("Id");
        var usernameOrd = reader.GetOrdinal("Username");
        var emailOrd = reader.GetOrdinal("Email");
        var passwordHashOrd = reader.GetOrdinal("PasswordHash");
        var companyIdOrd = reader.GetOrdinal("CompanyId");
        var companyNameOrd = reader.GetOrdinal("CompanyName");
        var mainProjectIdOrd = reader.GetOrdinal("MainProjectId");
        var mainProjectNameOrd = reader.GetOrdinal("MainProjectName");

        return new User
        {
            Id = !reader.IsDBNull(idOrd) ? reader.GetInt32(idOrd) : 0,
            Username = !reader.IsDBNull(usernameOrd) ? reader.GetString(usernameOrd) : string.Empty,
            Email = !reader.IsDBNull(emailOrd) ? reader.GetString(emailOrd) : string.Empty,
            PasswordHash = !reader.IsDBNull(passwordHashOrd) ? reader.GetString(passwordHashOrd) : string.Empty,
            CompanyId = !reader.IsDBNull(companyIdOrd) ? reader.GetInt32(companyIdOrd) : null,
            CompanyName = !reader.IsDBNull(companyNameOrd) ? reader.GetString(companyNameOrd) : null,
            MainProjectId = !reader.IsDBNull(mainProjectIdOrd) ? reader.GetInt32(mainProjectIdOrd) : null,
            MainProjectName = !reader.IsDBNull(mainProjectNameOrd) ? reader.GetString(mainProjectNameOrd) : null,
        };
    }

    public Task<User> GetInvitationByToken(string invitationToken)
    {
        throw new NotImplementedException();
    }
}