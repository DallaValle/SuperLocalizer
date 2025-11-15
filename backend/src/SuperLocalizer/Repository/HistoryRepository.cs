using System;
using System.Threading.Tasks;
using SuperLocalizer.Model;

namespace SuperLocalizer.Repository;

public interface IHistoryRepository
{
    Task Create(Guid projectId, string valueKey, SessionUser user, Value previousValue, Value newValue);
    Task<SearchResponse<HistoryItem>> Search(Guid projectId, SearchHistoryRequest request);
}

public class HistoryRepository : IHistoryRepository
{
    public Task Create(Guid projectId, string valueKey, SessionUser user, Value previousValue, Value newValue)
    {
        throw new NotImplementedException();
    }

    public Task<SearchResponse<HistoryItem>> Search(Guid projectId, SearchHistoryRequest request)
    {
        throw new NotImplementedException();
    }
}