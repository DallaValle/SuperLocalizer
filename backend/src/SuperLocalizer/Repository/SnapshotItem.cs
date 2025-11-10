using System;

namespace SuperLocalizer.Repository;

public class SnapshotItem
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string SnapshotData { get; set; }
    public string Description { get; set; }
    public DateTime InsertDate { get; set; }
}
