using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SuperLocalizer.Repository;

public interface ISnapshotRepository
{
    Task SaveSnapshotAsync(int projectId, string jsonContent);
}

public class SnapshotRepository : ISnapshotRepository
{
    private readonly string _connectionString;

    public SnapshotRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new ArgumentException("DefaultConnection is not configured");
    }

    public async Task SaveSnapshotAsync(int projectId, string jsonContent)
    {
        using var connection = new MySql.Data.MySqlClient.MySqlConnection(_connectionString);
        await connection.OpenAsync();

        using var command = connection.CreateCommand();
        command.CommandText = @"
            INSERT INTO ProjectSnapshot (ProjectId, SnapshotData, InsertDate)
            VALUES (@ProjectId, @SnapshotData, @InsertDate)";
        command.Parameters.AddWithValue("@ProjectId", projectId);
        command.Parameters.AddWithValue("@SnapshotData", jsonContent);
        command.Parameters.AddWithValue("@InsertDate", DateTime.UtcNow);

        await command.ExecuteNonQueryAsync();
    }
}