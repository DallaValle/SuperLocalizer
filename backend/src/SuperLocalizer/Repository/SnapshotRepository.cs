using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SuperLocalizer.Repository;

public interface ISnapshotRepository
{
    Task SaveSnapshotAsync(int projectId, string jsonContent);
    Task<List<SnapshotItem>> GetSnapshotsByProjectIdAsync(int projectId, int limit);
    Task<SnapshotItem> RollbackToSnapshotAsync(int snapshotId);
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

    public async Task<List<SnapshotItem>> GetSnapshotsByProjectIdAsync(int projectId, int limit)
    {
        var snapshots = new List<SnapshotItem>();
        using var connection = new MySql.Data.MySqlClient.MySqlConnection(_connectionString);
        await connection.OpenAsync();

        using var command = connection.CreateCommand();
        command.CommandText = @"
            SELECT Id, ProjectId, SnapshotData, InsertDate
            FROM ProjectSnapshot
            WHERE ProjectId = @ProjectId
            ORDER BY InsertDate DESC
            LIMIT @Limit";
        command.Parameters.AddWithValue("@ProjectId", projectId);
        command.Parameters.AddWithValue("@Limit", limit);

        using var reader = await command.ExecuteReaderAsync();
        int idOrdinal = reader.GetOrdinal("Id");
        int projectIdOrdinal = reader.GetOrdinal("ProjectId");
        int snapshotDataOrdinal = reader.GetOrdinal("SnapshotData");
        // int descriptionOrdinal = reader.GetOrdinal("Description");
        int insertDateOrdinal = reader.GetOrdinal("InsertDate");
        while (await reader.ReadAsync())
        {
            snapshots.Add(new SnapshotItem
            {
                Id = reader.GetInt32(idOrdinal),
                ProjectId = reader.GetInt32(projectIdOrdinal),
                SnapshotData = reader.GetString(snapshotDataOrdinal),
                // Description = reader.IsDBNull(descriptionOrdinal) ? null : reader.GetString(descriptionOrdinal),
                InsertDate = reader.GetDateTime(insertDateOrdinal)
            });
        }
        return snapshots;
    }

    public async Task<SnapshotItem> RollbackToSnapshotAsync(int snapshotId)
    {
        SnapshotItem snapshot = null;
        using var connection = new MySql.Data.MySqlClient.MySqlConnection(_connectionString);
        await connection.OpenAsync();

        using (var selectCommand = connection.CreateCommand())
        {
            selectCommand.CommandText = @"SELECT * FROM ProjectSnapshot WHERE Id = @SnapshotId";
            selectCommand.Parameters.AddWithValue("@SnapshotId", snapshotId);
            using var reader = await selectCommand.ExecuteReaderAsync();

            int idOrdinal = reader.GetOrdinal("Id");
            int projectIdOrdinal = reader.GetOrdinal("ProjectId");
            int snapshotDataOrdinal = reader.GetOrdinal("SnapshotData");
            // int descriptionOrdinal = reader.GetOrdinal("Description");
            int insertDateOrdinal = reader.GetOrdinal("InsertDate");
            while (await reader.ReadAsync())
            {
                snapshot = new SnapshotItem
                {
                    Id = reader.GetInt32(idOrdinal),
                    ProjectId = reader.GetInt32(projectIdOrdinal),
                    SnapshotData = reader.GetString(snapshotDataOrdinal),
                    // Description = reader.IsDBNull(descriptionOrdinal) ? null : reader.GetString(descriptionOrdinal),
                    InsertDate = reader.GetDateTime(insertDateOrdinal)
                };
            }
            // save a new snapshot and return the retrieved one
            await SaveSnapshotAsync(snapshot.ProjectId, snapshot.SnapshotData);
        }
        return snapshot;
    }
}