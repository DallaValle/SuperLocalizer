using System;
using System.Collections.Generic;

namespace SuperLocalizer.Model;

public class Property
{
    public string Key { get; set; }
    public List<Value> Values { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime UpdateDate { get; set; }
}

public class Value
{
    public string Language { get; set; }
    public string Text { get; set; }
    public bool IsVerified { get; set; }
    public bool IsReviewed { get; set; }
    public List<Comment> Comments { get; set; }
}

public class Comment
{
    public Guid Id { get; set; }
    public string Author { get; set; }
    public string Text { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime UpdateDate { get; set; }
}