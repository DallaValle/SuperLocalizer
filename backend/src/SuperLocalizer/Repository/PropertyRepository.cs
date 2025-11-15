using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SuperLocalizer.Model;

namespace SuperLocalizer.Repository;

public interface IPropertyRepository
{
    Task Create(Guid projectId, Property newProperty);
    Task<Property> Read(Guid projectId, string key);
    Task Update(Guid projectId, Property property);
    Task<bool> Delete(Guid projectId, string key);
    Task<SearchResponse<Property>> Search(Guid projectId, SearchPropertyRequest request);
    Task<bool> MergeProperties(Guid projectId, List<Property> newProperties);
}

public class PropertyRepository : IPropertyRepository
{
    private readonly string _connectionString;

    public PropertyRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public Task Create(Guid projectId, Property newProperty)
    {
        throw new NotImplementedException();
    }

    public Task<SearchResponse<Property>> Search(Guid projectId, SearchPropertyRequest request)
    {
        throw new NotImplementedException();
    }

    public Task<Property> Read(Guid projectId, string key)
    {
        throw new NotImplementedException();
    }

    public Task<bool> MergeProperties(Guid projectId, List<Property> newProperties)
    {
        throw new NotImplementedException();
    }

    public Task Update(Guid projectId, Property property)
    {
        throw new NotImplementedException();
    }

    public Task<bool> Delete(Guid projectId, string key)
    {
        throw new NotImplementedException();
    }
}