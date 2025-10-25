using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SuperLocalizer.Services;

namespace SuperLocalization.Tests;

public class PropertyReaderTests
{
    PropertyReader _sut = new PropertyReader();

    [Test]
    public void Load_ShouldReturnListOfProperties()
    {
        var json = JsonConvert.DeserializeObject<JObject>(File.ReadAllText("./SupertextLocalisation-main/de-CH/localization_de-CH.json"));
        var result = _sut.Load(json, "de-CH");
        Assert.That(result.Count, Is.EqualTo(2950));
    }

    [Test]
    public void Merge_ShouldMergePropertiesCorrectly()
    {
        var propertyLists = new List<List<SuperLocalizer.Model.Property>>();
        foreach (string fileName in Directory.GetFiles("./SupertextLocalisation-main", "localization_*.json", SearchOption.AllDirectories))
        {
            var lang = Path.GetFileNameWithoutExtension(fileName).Split('_')[1];
            var json = JsonConvert.DeserializeObject<JObject>(File.ReadAllText(fileName));
            var properties = _sut.Load(json, lang);
            propertyLists.Add(properties);
        }
        var merged = _sut.Merge(propertyLists);
        Assert.That(merged.Count, Is.EqualTo(2950));
    }
}