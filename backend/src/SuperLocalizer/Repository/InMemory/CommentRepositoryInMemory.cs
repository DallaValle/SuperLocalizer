using System;
using System.Collections.Generic;
using System.Linq;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public class CommentRepositoryInMemory : ICommentRepository
{
    private readonly IFusionCache _fusionCache;

    public CommentRepositoryInMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public List<Comment> GetComments(string key)
    {
        var allComments = _fusionCache.GetOrSet(CacheKeys.AllComments(key), new List<Comment>());
        return allComments.Where(c => c.ValueKey == key).ToList();
    }

    public void Create(Comment comment)
    {
        var allComments = _fusionCache.GetOrSet(CacheKeys.AllComments(comment.ValueKey), new List<Comment>());
        allComments.Add(comment);
        _fusionCache.Set(CacheKeys.AllComments(comment.ValueKey), allComments);
    }

    public void Delete(string valueKey, Guid id)
    {
        var allComments = _fusionCache.GetOrSet(CacheKeys.AllComments(valueKey), new List<Comment>());
        var commentToRemove = allComments.FirstOrDefault(c => c.Id == id);
        if (commentToRemove != null)
        {
            allComments.Remove(commentToRemove);
            _fusionCache.Set(CacheKeys.AllComments(valueKey), allComments);
        }
    }

    public void Update(Comment comment)
    {
        var allComments = _fusionCache.GetOrSet(CacheKeys.AllComments(comment.ValueKey), new List<Comment>());
        var index = allComments.FindIndex(c => c.Id == comment.Id);
        if (index != -1)
        {
            allComments[index] = comment;
            _fusionCache.Set(CacheKeys.AllComments(comment.ValueKey), allComments);
        }
    }
}