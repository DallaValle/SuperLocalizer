using System;

namespace SuperLocalizer.Model;

public class HistoryItem
{
    public Guid ValueId { get; set; }
    public string PreviousText { get; set; }
    public string NewText { get; set; }
    public bool? PreviousIsVerified { get; set; }
    public bool? NewIsVerified { get; set; }
    public bool? PreviousIsReviewed { get; set; }
    public bool? NewIsReviewed { get; set; }
    public DateTime Timestamp { get; set; }
    public string UserName { get; set; }
}