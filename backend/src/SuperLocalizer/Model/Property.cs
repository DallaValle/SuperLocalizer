using System;
using System.Collections.Generic;

namespace SuperLocalizer.Model;

public class Property
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Key { get; set; }
    public List<Value> Values { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime UpdateDate { get; set; }
}

public class Value
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PropertyId { get; set; }
    public string Language { get; set; }
    public string Text { get; set; }
    public bool IsVerified { get; set; }
    public bool IsReviewed { get; set; }
    public List<Comment> Comments { get; set; }
}

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ValueId { get; set; }
    public string Author { get; set; }
    public string Text { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime UpdateDate { get; set; }
}