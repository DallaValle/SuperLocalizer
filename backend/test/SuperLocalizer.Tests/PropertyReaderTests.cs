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
        var json = JsonConvert.DeserializeObject<JObject>(File.ReadAllText("./de-CH/localization_de-CH.json"));
        var result = _sut.Load(json, "de-CH");
        Assert.That(result.Count, Is.EqualTo(2950));
    }

    [Test]
    public void Merge_ShouldMergePropertiesCorrectly()
    {
        var allProperties = new Dictionary<string, Property>();
        foreach (string fileName in Directory.GetFiles(".", "localization_*.json", SearchOption.AllDirectories))
        {
            var lang = Path.GetFileNameWithoutExtension(fileName).Split('_')[1];
            var json = JsonConvert.DeserializeObject<JObject>(File.ReadAllText(fileName));
            var properties = _sut.Load(json, lang);
            allProperties = _sut.MergeValues(allProperties, properties);
        }
        Assert.That(allProperties.Count, Is.EqualTo(2950));
        Assert.That(allProperties.First().Value.Values.Count, Is.EqualTo(5));
    }
}