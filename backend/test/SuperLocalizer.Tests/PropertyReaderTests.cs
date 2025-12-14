using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SuperLocalizer.Services;
using SuperLocalizer.Model;
using System.Linq;

namespace SuperLocalization.Tests;

public class PropertyReaderTests
{
    PropertyReaderService _sut = new PropertyReaderService();

    [Test]
    public void Load_ShouldReturnListOfProperties()
    {
        var json = JsonConvert.DeserializeObject<JObject>(File.ReadAllText("./files/en.json"));
        var result = _sut.Load(json, "en");
        Assert.That(result.Count, Is.EqualTo(176));
    }

    [Test]
    public void Merge_ShouldMergePropertiesCorrectly()
    {
        var allProperties = new Dictionary<string, Property>();
        foreach (string fileName in Directory.GetFiles(".", "*.json", SearchOption.AllDirectories))
        {
            var lang = Path.GetFileNameWithoutExtension(fileName).Split('.')[0];
            var json = JsonConvert.DeserializeObject<JObject>(File.ReadAllText(fileName));
            var properties = _sut.Load(json, lang);
            allProperties = _sut.MergeValues(allProperties, properties);
        }
        Assert.That(allProperties.Count, Is.EqualTo(694));
        Assert.That(allProperties.First().Value.Values.Count, Is.EqualTo(2));
    }

    [Test]
    public void UnLoad_ShouldReturnJObject()
    {
        string value = File.ReadAllText("./files/en.json");
        var json = JsonConvert.DeserializeObject<JObject>(value);
        var result = _sut.Load(json, "en");
        var unLoaded = _sut.UnLoad(result, "en");
        Assert.That(unLoaded, Is.Not.Null);

        // Format the unloaded JSON to match the original formatting
        var formattedValue = JsonConvert.SerializeObject(json, Formatting.Indented);
        var formattedUnloaded = JsonConvert.SerializeObject(unLoaded, Formatting.Indented);
        Assert.That(formattedValue.Trim(), Is.EqualTo(formattedUnloaded.Trim()));
    }
}