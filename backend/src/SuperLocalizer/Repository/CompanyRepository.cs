using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using SuperLocalizer.Model;

namespace SuperLocalizer.Repository;

public interface ICompanyRepository
{
    Task<Company> Create(Company company);
    Task<Company> Read(Guid id);
    Task<Company> Update(Company company);
    Task<bool> Delete(Guid id);
    Task<bool> Exists(Guid id);
    Task<Company> GetCompanyByUserId(Guid userId);
}

public class CompanyRepository : ICompanyRepository
{
    private readonly string _connectionString;

    public CompanyRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    public async Task<Company> Read(Guid id)
    {
        const string query = @"
            SELECT Id, Name, Address, Email, Phone, InsertDate, UpdateDate
            FROM Company
            WHERE Id = @Id";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);

        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return MapToCompany(reader);
        }

        return null;
    }

    public async Task<Company> GetCompanyByUserId(Guid userId)
    {
        const string query = @"
            SELECT Id, Name, Address, Email, Phone, InsertDate, UpdateDate
            FROM Company
            WHERE Id IN (
                SELECT CompanyId FROM User WHERE Id = @UserId
            )";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@UserId", userId);
        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return MapToCompany(reader);
        }
        return null;
    }

    public async Task<Company> Create(Company company)
    {
        const string query = @"
            INSERT INTO Company (Name, Address, Email, Phone, InsertDate, UpdateDate)
            VALUES (@Name, @Address, @Email, @Phone, @InsertDate, @UpdateDate);
            SELECT LAST_INSERT_ID();";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);

        var now = DateTime.UtcNow;
        command.Parameters.AddWithValue("@Name", company.Name ?? string.Empty);
        command.Parameters.AddWithValue("@Address", company.Address ?? string.Empty);
        command.Parameters.AddWithValue("@Email", company.Email ?? string.Empty);
        command.Parameters.AddWithValue("@Phone", company.Phone ?? string.Empty);
        command.Parameters.AddWithValue("@InsertDate", now);
        command.Parameters.AddWithValue("@UpdateDate", now);
        var newId = Guid.NewGuid();
        command.Parameters.AddWithValue("@Id", newId);
        await connection.OpenAsync();
        await command.ExecuteNonQueryAsync();

        company.Id = newId;
        company.InsertDate = now;
        company.UpdateDate = now;

        return company;
    }

    public async Task<Company> Update(Company company)
    {
        const string query = @"
            UPDATE Company
            SET Name = @Name,
                Address = @Address,
                Email = @Email,
                Phone = @Phone,
                UpdateDate = @UpdateDate
            WHERE Id = @Id";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);

        var now = DateTime.UtcNow;
        command.Parameters.AddWithValue("@Id", company.Id);
        command.Parameters.AddWithValue("@Name", company.Name ?? string.Empty);
        command.Parameters.AddWithValue("@Address", company.Address ?? string.Empty);
        command.Parameters.AddWithValue("@Email", company.Email ?? string.Empty);
        command.Parameters.AddWithValue("@Phone", company.Phone ?? string.Empty);
        command.Parameters.AddWithValue("@UpdateDate", now);

        await connection.OpenAsync();
        var rowsAffected = await command.ExecuteNonQueryAsync();

        if (rowsAffected > 0)
        {
            company.UpdateDate = now;
            return company;
        }

        return null;
    }

    public async Task<bool> Delete(Guid id)
    {
        const string query = "DELETE FROM Company WHERE Id = @Id";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);

        await connection.OpenAsync();
        var rowsAffected = await command.ExecuteNonQueryAsync();

        return rowsAffected > 0;
    }

    public async Task<bool> Exists(Guid id)
    {
        const string query = "SELECT COUNT(1) FROM Company WHERE Id = @Id";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);

        await connection.OpenAsync();
        var count = Convert.ToInt32(await command.ExecuteScalarAsync());

        return count > 0;
    }

    private static Company MapToCompany(IDataReader reader)
    {
        return new Company
        {
            Id = reader.GetGuid(reader.GetOrdinal("Id")),
            Name = reader.GetString(reader.GetOrdinal("Name")),
            Address = reader.GetString(reader.GetOrdinal("Address")),
            Email = reader.GetString(reader.GetOrdinal("Email")),
            Phone = reader.GetString(reader.GetOrdinal("Phone")),
            InsertDate = reader.GetDateTime(reader.GetOrdinal("InsertDate")),
            UpdateDate = reader.GetDateTime(reader.GetOrdinal("UpdateDate"))
        };
    }
}