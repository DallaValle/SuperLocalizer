using SuperLocalizer.Model;

namespace SuperLocalizer.Repository;

public interface IHistoryRepository
{
    void SaveHistory(string valueKey, Value previousValue, Value newValue);
    SearchResponse<HistoryItem> SearchHistory(SearchHistoryRequest request);
}

public class HistoryRepository : IHistoryRepository
{
    public void SaveHistory(string valueKey, Value previousValue, Value newValue)
    {
        throw new System.NotImplementedException();
    }

    public SearchResponse<HistoryItem> SearchHistory(SearchHistoryRequest request)
    {
        throw new System.NotImplementedException();
    }
}