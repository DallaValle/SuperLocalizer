using Newtonsoft.Json.Linq;

namespace SuperLocalizer.Services;

public class FileService
{
    public byte[] GenerateFileContent(JObject json)
    {
        return System.Text.Encoding.UTF8.GetBytes(json.ToString());
    }

    public JObject GenerateJsonFromByteArray(byte[] fileContent)
    {
        var jsonString = System.Text.Encoding.UTF8.GetString(fileContent);
        return JObject.Parse(jsonString);
    }
}