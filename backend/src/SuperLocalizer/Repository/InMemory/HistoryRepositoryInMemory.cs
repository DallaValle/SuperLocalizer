using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public class HistoryRepositoryInMemory : IHistoryRepository
{
    private readonly IFusionCache _fusionCache;

    public HistoryRepositoryInMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public Task<SearchResponse<HistoryItem>> Search(Guid projectId, SearchHistoryRequest request)
    {
        var allHistories = _fusionCache.GetOrSet(
            key: CacheKeys.AllHistories(projectId),
            new Dictionary<string, Stack<HistoryItem>>()
        );
        var allItems = new List<HistoryItem>();
        foreach (var itemList in allHistories.Values)
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

        return Task.FromResult(new SearchResponse<HistoryItem>
        {
            Items = pagedItems,
            Page = request.Page ?? 1,
            Size = request.Size ?? totalItems,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling((double)totalItems / (request.Size ?? totalItems))
        });
    }

    public Task Create(Guid projectId, string valueKey, SessionUser user, Value previousValue, Value newValue)
    {
        var allHistories = _fusionCache.GetOrSet(
            key: CacheKeys.AllHistories(projectId),
            new Dictionary<string, Stack<HistoryItem>>()
        );
        previousValue.Comments = null; // Exclude comments from history
        newValue.Comments = null; // Exclude comments from history

        if (previousValue == newValue)
        {
            return Task.CompletedTask; // No changes detected
        }

        var historyItem = new HistoryItem
        {
            ValueKey = valueKey,
            PreviousValue = previousValue,
            NewValue = newValue,
            Timestamp = DateTime.UtcNow,
            UserName = user.Username,
            UserId = user.Id,
        };

        if (!allHistories.ContainsKey(valueKey))
        {
            allHistories[valueKey] = new Stack<HistoryItem>();
        }
        // Add the new history item or merge changes arrived in the similar time
        if (allHistories[valueKey].Count == 0)
        {
            allHistories[valueKey].Push(historyItem);
        }
        else
        {
            var last = allHistories[key: valueKey].Pop();
            if (last.Timestamp.AddMilliseconds(2000) < historyItem.Timestamp)
            {
                allHistories[valueKey].Push(last); // Put back the last item
                allHistories[valueKey].Push(historyItem); // Add the new item
            }
            else
            {
                // Merge timestamps if no significant changes
                last.Timestamp = historyItem.Timestamp;
                last.NewValue = historyItem.NewValue;
                allHistories[valueKey].Push(last);
            }
        }
        _fusionCache.Set(key: CacheKeys.AllHistories(projectId), value: allHistories);
        return Task.CompletedTask;
    }
}