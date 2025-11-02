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
    public List<Property> Properties { get; set; }
    public int CompanyId { get; set; }
}