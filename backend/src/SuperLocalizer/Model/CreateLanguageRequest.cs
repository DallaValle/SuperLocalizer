namespace SuperLocalizer.Model;

public class CreateLanguageRequest
{
    public string Language { get; set; }
    public bool UseAi { get; set; }
    public bool NeedExpertVerification { get; set; }
}