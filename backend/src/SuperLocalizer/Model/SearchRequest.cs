namespace SuperLocalizer.Model;

using System.Collections.Generic;

public class SearchRequest
{
    public string SearchTerm { get; set; }
    public string Language { get; set; }
    // Not used yet
    public string Text { get; set; }
    public bool? IsVerified { get; set; }
    public bool? IsReviewed { get; set; }
    public SearchOrder OrderBy { get; set; } = SearchOrder.Key;
    public SearchOrderDirection OrderDirection { get; set; } = SearchOrderDirection.asc;
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

public enum SearchOrder
{
    Key,
    InsertDate,
    UpdateDate,
}

public enum SearchOrderDirection
{
    asc,
    desc,
}