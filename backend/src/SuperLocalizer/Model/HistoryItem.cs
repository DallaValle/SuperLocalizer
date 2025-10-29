using System;

namespace SuperLocalizer.Model;

public class HistoryItem
{
    public string ValueKey { get; set; }
    public string UserName { get; set; }
    public DateTime Timestamp { get; set; }
    // Json serialized values
    public Value PreviousValue { get; set; }
    public Value NewValue { get; set; }
}