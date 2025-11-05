using System;
using System.Collections.Generic;
using System.Linq;

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
    public List<string> SupportedLanguages => Properties?.FirstOrDefault()?.Values?.Select(v => v.Language)?.Distinct()?.ToList() ?? new List<string>();
}