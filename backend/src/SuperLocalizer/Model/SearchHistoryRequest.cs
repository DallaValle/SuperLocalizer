using System;

namespace SuperLocalizer.Model;

public class SearchHistoryRequest
{
    public string ValueKey { get; set; }
    public string UserName { get; set; }
    // time rage filters
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int? Page { get; set; } = 1;
    public int? Size { get; set; } = 10;
}