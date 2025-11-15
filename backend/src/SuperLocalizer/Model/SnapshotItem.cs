using System;

namespace SuperLocalizer.Model;

public class SnapshotItem
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string SnapshotData { get; set; }
    public string Description { get; set; }
    public DateTime InsertDate { get; set; }
}
