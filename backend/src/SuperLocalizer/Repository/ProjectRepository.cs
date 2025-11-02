using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using SuperLocalizer.Model;

namespace SuperLocalizer.Repository;

public interface IProjectRepository
{
    Task<Project> GetByIdAsync(int companyId, int id);
    Task<IEnumerable<Project>> GetAllAsync(int companyId);
    Task<Project> CreateAsync(Project project);
    Task<Project> UpdateAsync(Project project);
    Task<bool> DeleteAsync(int companyId, int id);
    Task<bool> ExistsAsync(int companyId, int id);
}

public class ProjectRepository : IProjectRepository
{
    private readonly string _connectionString;

    public ProjectRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    public async Task<Project> GetByIdAsync(int companyId, int id)
    {
        const string query = @"
            SELECT Id, Name, Description, CompanyId, InsertDate, UpdateDate
            FROM Project
            WHERE Id = @Id AND CompanyId = @CompanyId";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@CompanyId", companyId);

        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return MapToProject(reader);
        }

        return null;
    }

    public async Task<IEnumerable<Project>> GetAllAsync(int companyId)
    {
        const string query = @"
            SELECT Id, Name, Description, CompanyId, InsertDate, UpdateDate
            FROM Project
            WHERE CompanyId = @CompanyId
            ORDER BY Name";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@CompanyId", companyId);

        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();

        var projects = new List<Project>();
        while (await reader.ReadAsync())
        {
            projects.Add(MapToProject(reader));
        }

        return projects;
    }

    public async Task<Project> CreateAsync(Project project)
    {
        const string query = @"
            INSERT INTO Project (Name, Description, CompanyId, InsertDate, UpdateDate)
            VALUES (@Name, @Description, @CompanyId, @InsertDate, @UpdateDate);
            SELECT LAST_INSERT_ID();";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);

        var now = DateTime.UtcNow;
        command.Parameters.AddWithValue("@Name", project.Name ?? string.Empty);
        command.Parameters.AddWithValue("@Description", project.Description ?? string.Empty);
        command.Parameters.AddWithValue("@CompanyId", project.CompanyId);
        command.Parameters.AddWithValue("@InsertDate", now);
        command.Parameters.AddWithValue("@UpdateDate", now);

        await connection.OpenAsync();
        var newId = Convert.ToInt32(await command.ExecuteScalarAsync());

        project.Id = newId;
        project.InsertDate = now;
        project.UpdateDate = now;

        return project;
    }

    public async Task<Project> UpdateAsync(Project project)
    {
        const string query = @"
            UPDATE Project
            SET Name = @Name,
                Description = @Description,
                CompanyId = @CompanyId,
                UpdateDate = @UpdateDate
            WHERE Id = @Id";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);

        var now = DateTime.UtcNow;
        command.Parameters.AddWithValue("@Id", project.Id);
        command.Parameters.AddWithValue("@Name", project.Name ?? string.Empty);
        command.Parameters.AddWithValue("@Description", project.Description ?? string.Empty);
        command.Parameters.AddWithValue("@CompanyId", project.CompanyId);
        command.Parameters.AddWithValue("@UpdateDate", now);

        await connection.OpenAsync();
        var rowsAffected = await command.ExecuteNonQueryAsync();

        if (rowsAffected > 0)
        {
            project.UpdateDate = now;
            return project;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int companyId, int id)
    {
        const string query = "DELETE FROM Project WHERE Id = @Id AND CompanyId = @CompanyId";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@CompanyId", companyId);

        await connection.OpenAsync();
        var rowsAffected = await command.ExecuteNonQueryAsync();

        return rowsAffected > 0;
    }

    public async Task<bool> ExistsAsync(int companyId, int id)
    {
        const string query = "SELECT COUNT(1) FROM Project WHERE Id = @Id AND CompanyId = @CompanyId";

        using var connection = new MySqlConnection(_connectionString);
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@CompanyId", companyId);

        await connection.OpenAsync();
        var count = Convert.ToInt32(await command.ExecuteScalarAsync());

        return count > 0;
    }

    private static Project MapToProject(IDataReader reader)
    {
        var project = new Project
        {
            Id = reader.GetInt32(reader.GetOrdinal("Id")),
            Name = reader.GetString(reader.GetOrdinal("Name")),
            Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
            InsertDate = reader.GetDateTime(reader.GetOrdinal("InsertDate")),
            UpdateDate = reader.IsDBNull(reader.GetOrdinal("UpdateDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("UpdateDate")),
            CompanyId = reader.GetInt32(reader.GetOrdinal("CompanyId"))
        };

        return project;
    }
}