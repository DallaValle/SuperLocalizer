using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using SuperLocalizer.Model;

namespace SuperLocalizer.Services;

public interface IPropertyReader
{
    List<Property> Load(JObject json, string language);
    Dictionary<string, Property> Merge(List<List<Property>> propertyLists);
}

public class PropertyReader : IPropertyReader
{
    public List<Property> Load(JObject json, string language)
    {
        var properties = new List<Property>();
        var flattenedProperties = new Dictionary<string, string>();

        // Flatten the JSON object recursively
        FlattenJson(json, string.Empty, flattenedProperties);

        // Convert flattened properties to Property objects
        foreach (var kvp in flattenedProperties)
        {
            var property = new Property
            {
                Key = kvp.Key,
                Values = new List<Value>
                {
                    new Value
                    {
                        Language = language,
                        Text = kvp.Value,
                        IsVerified = false,
                        IsReviewed = false,
                        Comments = new List<Comment>()
                    }
                },
                InsertDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow
            };

            properties.Add(property);
        }

        return properties;
    }

    public Dictionary<string, Property> Merge(List<List<Property>> propertyLists)
    {
        // the result list should contains all unique properties based on their keys and merge their values
        var mergedProperties = new Dictionary<string, Property>();
        foreach (var propertyList in propertyLists)
        {
            foreach (var property in propertyList)
            {
                if (mergedProperties.ContainsKey(property.Key))
                {
                    // Merge values
                    mergedProperties[property.Key].Values.AddRange(property.Values);
                    mergedProperties[property.Key].UpdateDate = DateTime.UtcNow;
                }
                else
                {
                    mergedProperties[property.Key] = property;
                }
            }
        }
        return mergedProperties;
    }

    private void FlattenJson(JToken token, string prefix, Dictionary<string, string> result)
    {
        switch (token.Type)
        {
            case JTokenType.Object:
                foreach (var property in ((JObject)token).Properties())
                {
                    var key = string.IsNullOrEmpty(prefix)
                        ? property.Name
                        : $"{prefix}.{property.Name}";
                    FlattenJson(property.Value, key, result);
                }
                break;

            case JTokenType.Array:
                var array = (JArray)token;
                for (int i = 0; i < array.Count; i++)
                {
                    var key = $"{prefix}[{i}]";
                    FlattenJson(array[i], key, result);
                }
                break;

            case JTokenType.String:
            case JTokenType.Integer:
            case JTokenType.Float:
            case JTokenType.Boolean:
            case JTokenType.Date:
                result[prefix] = token.ToString();
                break;

            case JTokenType.Null:
                result[prefix] = string.Empty;
                break;
        }
    }
}