using System.Collections.Generic;
using SuperLocalizer.Model;

namespace SuperLocalizer.Repository;

public interface IPropertyRepository
{
    SearchResponse<Property> GetProperties(int projectId, SearchPropertyRequest request);
    Property GetPropertyByKey(int projectId, string key);
    void UpdateProperty(int projectId, Property property);
    bool MergeProperties(int projectId, List<Property> newProperties);
}

public class PropertyRepository : IPropertyRepository
{
    private readonly string _connectionString;

    public PropertyRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public SearchResponse<Property> GetProperties(int projectId, SearchPropertyRequest request)
    {
        throw new System.NotImplementedException();
    }

    public Property GetPropertyByKey(int projectId, string key)
    {
        throw new System.NotImplementedException();
    }

    public bool MergeProperties(int projectId, List<Property> newProperties)
    {
        throw new System.NotImplementedException();
    }

    public void UpdateProperty(int projectId, Property property)
    {
        throw new System.NotImplementedException();
    }
}