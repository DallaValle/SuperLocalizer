using System;
using System.Collections.Generic;

namespace SuperLocalizer.Model;

public class Company
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime UpdateDate { get; set; }
    public List<Project> Projects { get; set; }
}