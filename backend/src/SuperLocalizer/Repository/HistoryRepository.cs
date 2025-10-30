using System;
using System.Collections.Generic;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public interface IHistoryRepository
{
    void SaveHistory(string valueKey, Value previousValue, Value newValue);
    SearchResponse<HistoryItem> SearchHistory(SearchHistoryRequest request);
}

public class HistoryRepositoryMemory : IHistoryRepository
{
    private readonly IFusionCache _fusionCache;
    private readonly Dictionary<string, List<HistoryItem>> _historyStorage = new();

    public HistoryRepositoryMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public SearchResponse<HistoryItem> SearchHistory(SearchHistoryRequest request)
    {
        var allItems = new List<HistoryItem>();
        foreach (var itemList in _historyStorage.Values)
        {
            allItems.AddRange(itemList);
        }

        // Apply filtering
        if (!string.IsNullOrEmpty(request.ValueKey))
        {
            allItems = allItems.FindAll(h => h.ValueKey == request.ValueKey);
        }

        if (!string.IsNullOrEmpty(request.UserName))
        {
            allItems = allItems.FindAll(h => h.UserName == request.UserName);
        }

        if (request.FromDate.HasValue)
        {
            allItems = allItems.FindAll(h => h.Timestamp >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            allItems = allItems.FindAll(h => h.Timestamp <= request.ToDate.Value);
        }

        // Apply pagination
        var totalItems = allItems.Count;
        var pagedItems = allItems;
        if (request.Page.HasValue && request.Size.HasValue)
        {
            pagedItems = allItems.GetRange((request.Page.Value - 1) * request.Size.Value, Math.Min(request.Size.Value, totalItems - (request.Page.Value - 1) * request.Size.Value));
        }

        return new SearchResponse<HistoryItem>
        {
            Items = pagedItems,
            Page = request.Page ?? 1,
            Size = request.Size ?? totalItems,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling((double)totalItems / (request.Size ?? totalItems))
        };
    }

    public void SaveHistory(string valueKey, Value previousValue, Value newValue)
    {
        previousValue.Comments = null; // Exclude comments from history
        newValue.Comments = null; // Exclude comments from history

        if (previousValue == newValue)
        {
            return; // No changes detected
        }

        var historyItem = new HistoryItem
        {
            ValueKey = valueKey,
            PreviousValue = previousValue,
            NewValue = newValue,
            Timestamp = DateTime.UtcNow,
            UserName = "Admin" // Replace with actual user retrieval logic
        };

        if (!_historyStorage.ContainsKey(valueKey))
        {
            _historyStorage[valueKey] = new List<HistoryItem>();
        }
        _historyStorage[valueKey].Add(historyItem);
    }
}