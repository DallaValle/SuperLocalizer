using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using SuperLocalizer.Model;

namespace SuperLocalizer.Services;

public interface IPropertyReader
{
    List<Property> Load(JObject json, string language, bool defaultIsVerified = true, bool defaultIsReviewed = true);
    List<Property> MergeValues(List<List<Property>> propertyLists);
}

public class PropertyReader : IPropertyReader
{
    private readonly string mainLanguage = "de-CH";
    private readonly List<string> supportedLanguages = new List<string>
    {
        "de-CH", "de-DE", "fr", "it", "en"
    };

    public List<Property> Load(JObject json, string language, bool defaultIsVerified = true, bool defaultIsReviewed = true)
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
                        PropertyKey = kvp.Key,
                        Language = language,
                        Text = kvp.Value,
                        IsVerified = defaultIsVerified,
                        IsReviewed = defaultIsReviewed,
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

    public List<Property> MergeValues(List<List<Property>> propertyLists)
    {
        // the result list should contains all unique properties based on their keys and merge their values
        var mergedProperties = new Dictionary<string, Property>();
        foreach (var propertyList in propertyLists)
        {
            foreach (var property in propertyList)
            {
                if (mergedProperties.ContainsKey(property.Key))
                {
                    // Update PropertyId for each value before merging
                    property.Values = property.Values.ConvertAll(_ => { _.PropertyKey = property.Key; return _; });
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
        // Controls that each property has values for all supported languages
        foreach (var prop in mergedProperties.Values)
        {
            foreach (var lang in supportedLanguages)
            {
                if (!prop.Values.Any(v => v.Language.Equals(lang, StringComparison.OrdinalIgnoreCase)))
                {
                    prop.Values.Add(new Value
                    {
                        Language = lang,
                        Text = string.Empty,
                        IsVerified = false,
                        IsReviewed = false,
                        Comments = new List<Comment>(),
                        PropertyKey = prop.Key,
                    });
                }
            }
        }
        return mergedProperties.Values.ToList();
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