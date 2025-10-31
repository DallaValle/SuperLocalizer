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
    public string Key => $"{PropertyKey}_{Language}";
    public string PropertyKey { get; set; }
    public string Language { get; set; }
    public string Text { get; set; }
    public bool IsVerified { get; set; }
    public bool IsReviewed { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime UpdateDate { get; set; }
    public List<Comment> Comments { get; set; }

    public override bool Equals(object obj)
    {
        if (obj is Value other)
        {
            return PropertyKey == other.PropertyKey &&
                   Language == other.Language &&
                   Text == other.Text &&
                   IsVerified == other.IsVerified &&
                   IsReviewed == other.IsReviewed;
        }
        return false;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(PropertyKey, Language, Text, IsVerified, IsReviewed);
    }

    public static bool operator ==(Value left, Value right)
    {
        if (ReferenceEquals(left, right))
            return true;
        if (left is null || right is null)
            return false;
        return left.Equals(right);
    }

    public static bool operator !=(Value left, Value right)
    {
        return !(left == right);
    }
}

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ValueKey { get; set; }
    public string Author { get; set; }
    public string Text { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime UpdateDate { get; set; }
}