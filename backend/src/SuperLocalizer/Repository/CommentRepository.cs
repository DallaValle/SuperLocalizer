using System;
using System.Collections.Generic;
using System.Linq;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public interface ICommentRepository
{
    List<Comment> GetComments(string key);
    void Create(Comment comment);
    void Delete(Guid id);
    void Update(Comment comment);
}

public class CommentRepositoryMemory : ICommentRepository
{
    private readonly IFusionCache _fusionCache;

    public CommentRepositoryMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public List<Comment> GetComments(string key)
    {
        var allComments = _fusionCache.GetOrSet(CacheKeys.AllComments, _ => GetValueFromDatabase());
        return allComments.Where(c => c.ValueKey == key).ToList();
    }

    public void Create(Comment comment)
    {
        var allComments = _fusionCache.GetOrSet(CacheKeys.AllComments, _ => GetValueFromDatabase());
        allComments.Add(comment);
        _fusionCache.Set(CacheKeys.AllComments, allComments);
    }

    public void Delete(Guid id)
    {
        var allComments = _fusionCache.GetOrSet(CacheKeys.AllComments, _ => GetValueFromDatabase());
        var commentToRemove = allComments.FirstOrDefault(c => c.Id == id);
        if (commentToRemove != null)
        {
            allComments.Remove(commentToRemove);
            _fusionCache.Set(CacheKeys.AllComments, allComments);
        }
    }

    public void Update(Comment comment)
    {
        var allComments = _fusionCache.GetOrSet(CacheKeys.AllComments, _ => GetValueFromDatabase());
        var index = allComments.FindIndex(c => c.Id == comment.Id);
        if (index != -1)
        {
            allComments[index] = comment;
            _fusionCache.Set(CacheKeys.AllComments, allComments);
        }
    }

    private List<Comment> GetValueFromDatabase()
    {
        // Simulate database fetch
        return new List<Comment>();
    }
}