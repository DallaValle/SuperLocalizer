namespace SuperLocalizer.Model;

using System.Collections.Generic;

public class CreatePropertyRequest
{
    public string Key { get; set; }
    public List<Value> Values { get; set; }
}
