using System;
using System.Collections.Generic;

namespace SuperLocalizer.Model;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime? UpdateDate { get; set; }
    public int CompanyId { get; set; }
    public List<string> Languages { get; set; } = new List<string>();
}