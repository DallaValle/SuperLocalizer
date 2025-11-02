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
    Task<Company> GetByIdAsync(int id);
    Task<IEnumerable<Company>> GetAllAsync();
    Task<Company> CreateAsync(Company company);
    Task<Company> UpdateAsync(Company company);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}

public class CompanyRepository : ICompanyRepository
{
    private readonly string _connectionString;

    public CompanyRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    public async Task<Company> GetByIdAsync(int id)
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

    public async Task<IEnumerable<Company>> GetAllAsync()
    {
        const string query = @"
            SELECT Id, Name, Address, Email, Phone, InsertDate, UpdateDate
            FROM Company
            ORDER BY Name";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);

        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();

        var companies = new List<Company>();
        while (await reader.ReadAsync())
        {
            companies.Add(MapToCompany(reader));
        }

        return companies;
    }

    public async Task<Company> CreateAsync(Company company)
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

        await connection.OpenAsync();
        var newId = Convert.ToInt32(await command.ExecuteScalarAsync());

        company.Id = newId;
        company.InsertDate = now;
        company.UpdateDate = now;

        return company;
    }

    public async Task<Company> UpdateAsync(Company company)
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

    public async Task<bool> DeleteAsync(int id)
    {
        const string query = "DELETE FROM Company WHERE Id = @Id";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);

        await connection.OpenAsync();
        var rowsAffected = await command.ExecuteNonQueryAsync();

        return rowsAffected > 0;
    }

    public async Task<bool> ExistsAsync(int id)
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
            Id = reader.GetInt32(reader.GetOrdinal("Id")),
            Name = reader.GetString(reader.GetOrdinal("Name")),
            Address = reader.GetString(reader.GetOrdinal("Address")),
            Email = reader.GetString(reader.GetOrdinal("Email")),
            Phone = reader.GetString(reader.GetOrdinal("Phone")),
            InsertDate = reader.GetDateTime(reader.GetOrdinal("InsertDate")),
            UpdateDate = reader.GetDateTime(reader.GetOrdinal("UpdateDate"))
        };
    }
}