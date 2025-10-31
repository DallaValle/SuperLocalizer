using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using SuperLocalizer.Model;

namespace SuperLocalizer.Services;

public interface IPropertyReaderService
{
    List<Property> Load(JObject json, string language, bool defaultIsVerified = true, bool defaultIsReviewed = true);
    JObject UnLoad(List<Property> properties, string language);
    Dictionary<string, Property> MergeValues(Dictionary<string, Property> allProperties, List<Property> newProperties);
}

public class PropertyReaderService : IPropertyReaderService
{
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

    // Scenario: Import method is called from Azure when PR is completed, merge to develop branch.
    // Dev team only add properties or rename property keys.
    // Can happen that in the meantime some language specialists have updated some translations: property -> value -> text.
    // We keep all property value text from currentProperties and we add the new properties from newProperties.
    // A conflict happens when a property has changed key and a value text has changed for the same language.
    public Dictionary<string, Property> MergeValues(Dictionary<string, Property> allProperties, List<Property> newProperties)
    {
        if (allProperties.Count == 0)
        {
            return newProperties.ToDictionary(p => p.Key, p => p);
        }

        foreach (var property in newProperties)
        {
            if (allProperties.ContainsKey(property.Key))
            {
                // Update PropertyId for each value before merging
                property.Values = property.Values.ConvertAll(_ => { _.PropertyKey = property.Key; return _; });
                // Merge values
                allProperties[property.Key].Values.AddRange(property.Values);
                allProperties[property.Key].UpdateDate = DateTime.UtcNow;
            }
            else
            {
                allProperties[property.Key] = property;
            }
        }
        // Controls that each property has values for all supported languages
        foreach (var prop in allProperties.Values)
        {
            var langs = allProperties.First().Value.Values.ConvertAll(_ => _.Language);
            foreach (var lang in langs)
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
            // Ordering values by language
            prop.Values.Sort((a, b) => string.Compare(a.Language, b.Language, StringComparison.OrdinalIgnoreCase));
        }
        return allProperties;
    }

    public JObject UnLoad(List<Property> properties, string language)
    {
        var result = new JObject();
        foreach (var property in properties)
        {
            var mainValue = property.Values.FirstOrDefault(v => v.Language.Equals(language, StringComparison.OrdinalIgnoreCase));
            if (mainValue != null)
            {
                // Set the value in the result JSON object based on the property key
                var keys = property.Key.Split('.');
                JObject currentObject = result;
                for (int i = 0; i < keys.Length; i++)
                {
                    var key = keys[i];
                    if (i == keys.Length - 1)
                    {
                        // Last key, set the value
                        currentObject[key] = mainValue.Text;
                    }
                    else
                    {
                        // Intermediate key, create or navigate to the nested object
                        if (currentObject[key] == null)
                        {
                            currentObject[key] = new JObject();
                        }
                        currentObject = (JObject)currentObject[key];
                    }
                }
            }
        }
        return result;
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