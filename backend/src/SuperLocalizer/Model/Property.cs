using System;
using System.Collections.Generic;

namespace SuperLocalizer.Model;

public class Property
{
    public string Key { get; set; }
    public List<Value> Values { get; set; }
    public DateTime InsertDate { get; set; }
    public DateTime UpdateDate { get; set; }
}