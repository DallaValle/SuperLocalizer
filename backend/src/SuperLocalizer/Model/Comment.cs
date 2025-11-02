using System;

namespace SuperLocalizer.Model;

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ValueKey { get; set; }
    public string Author { get; set; }
    public string Text { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime UpdateDate { get; set; }
}