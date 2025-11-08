using System.Threading.Tasks;
using SuperLocalizer.Model;

namespace SuperLocalizer.Repository;

public interface IHistoryRepository
{
    Task SaveHistory(int projectId, string valueKey, CurrentUser user, Value previousValue, Value newValue);
    Task<SearchResponse<HistoryItem>> SearchHistory(int projectId, SearchHistoryRequest request);
}

public class HistoryRepository : IHistoryRepository
{
    public Task SaveHistory(int projectId, string valueKey, CurrentUser user, Value previousValue, Value newValue)
    {
        throw new System.NotImplementedException();
    }

    public Task<SearchResponse<HistoryItem>> SearchHistory(int projectId, SearchHistoryRequest request)
    {
        throw new System.NotImplementedException();
    }
}