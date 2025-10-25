using System.Collections.Generic;

namespace SuperLocalizer.Model;

public class SearchRequest
{
    public string Key { get; set; }
    public string Language { get; set; }
    public string Text { get; set; }
    public bool? IsVerified { get; set; }
    public bool? IsReviewed { get; set; }
    public string OrderBy { get; set; } = "Key";
    public string OrderDirection { get; set; } = "asc";
    public int? Page { get; set; } = 1;
    public int? Size { get; set; } = 10;
}

public class SearchResponse
{
    public List<Property> Items { get; set; }
    public int Page { get; set; }
    public int Size { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
}

public class UpdateValueRequest
{
    public string Text { get; set; }
    public bool? IsVerified { get; set; }
    public bool? IsReviewed { get; set; }
}