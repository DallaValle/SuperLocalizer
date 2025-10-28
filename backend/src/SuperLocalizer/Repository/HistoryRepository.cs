using System;
using System.Collections.Generic;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public interface IHistoryRepository
{
    void SaveHistory(Guid valueId, string previousText, string newText);
    List<HistoryItem> GetHistoryById(Guid valueId);
    List<HistoryItem> GetHistoryByUserName(string userName);
    List<HistoryItem> GetHistoryByDateRange(DateTime from, DateTime to);
}

public class HistoryRepositoryMemory : IHistoryRepository
{
    private readonly IFusionCache _fusionCache;
    private readonly Dictionary<Guid, List<HistoryItem>> _historyStorage = new();

    public HistoryRepositoryMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public List<HistoryItem> GetHistoryByDateRange(DateTime from, DateTime to)
    {
        var result = new List<HistoryItem>();
        foreach (var historyList in _historyStorage.Values)
        {
            foreach (var item in historyList)
            {
                if (item.Timestamp >= from && item.Timestamp <= to)
                {
                    result.Add(item);
                }
            }
        }
        return result;
    }

    public List<HistoryItem> GetHistoryById(Guid valueId)
    {
        return _historyStorage.ContainsKey(valueId) ? _historyStorage[valueId] : new List<HistoryItem>();
    }

    public List<HistoryItem> GetHistoryByUserName(string userName)
    {
        var result = new List<HistoryItem>();
        foreach (var historyList in _historyStorage.Values)
        {
            foreach (var item in historyList)
            {
                if (item.UserName.Equals(userName, StringComparison.OrdinalIgnoreCase))
                {
                    result.Add(item);
                }
            }
        }
        return result;
    }

    public void SaveHistory(Guid valueId, string previousText, string newText)
    {
        var historyItem = new HistoryItem
        {
            ValueId = valueId,
            PreviousText = previousText,
            NewText = newText,
            Timestamp = DateTime.UtcNow,
            UserName = "Admin" // Replace with actual user retrieval logic
        };

        if (!_historyStorage.ContainsKey(valueId))
        {
            _historyStorage[valueId] = new List<HistoryItem>();
        }
        _historyStorage[valueId].Add(historyItem);
    }
}