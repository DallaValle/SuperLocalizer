using System;
using System.Collections.Generic;
using SuperLocalizer.Model;

namespace SuperLocalizer.Repository;

public interface ICommentRepository
{
    List<Comment> GetCommentsByPropertyKey(string key);
    void Create(Comment comment);
    void Delete(string valueKey, Guid id);
    void Update(Comment comment);
}

public class CommentRepository : ICommentRepository
{
    private readonly string _connectionString;

    public CommentRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public void Create(Comment comment)
    {
        throw new NotImplementedException();
    }

    public void Delete(string valueKey, Guid id)
    {
        throw new NotImplementedException();
    }

    public List<Comment> GetCommentsByPropertyKey(string key)
    {
        throw new NotImplementedException();
    }

    public void Update(Comment comment)
    {
        throw new NotImplementedException();
    }
}