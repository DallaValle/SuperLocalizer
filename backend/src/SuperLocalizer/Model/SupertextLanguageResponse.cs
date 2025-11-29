using System.Collections.Generic;
using Newtonsoft.Json;

namespace SuperLocalizer.Model
{
    /// <summary>
    /// Represents the response from Supertext API containing supported language features
    /// </summary>
    public class SupertextLanguageResponse
    {
        /// <summary>
        /// List of supported language features for different source-target language pairs
        /// </summary>
        [JsonProperty("supported_features")]
        public List<LanguageFeature> SupportedFeatures { get; set; } = new List<LanguageFeature>();
    }

    /// <summary>
    /// Represents a language pair with its supported features
    /// </summary>
    public class LanguageFeature
    {
        /// <summary>
        /// Source language code (e.g., "en", "de", "fr")
        /// </summary>
        [JsonProperty("source_lang")]
        public string SourceLang { get; set; }

        /// <summary>
        /// Target language code (e.g., "de-CH", "fr-FR", "it-IT")
        /// </summary>
        [JsonProperty("target_lang")]
        public string TargetLang { get; set; }

        /// <summary>
        /// List of features supported for this language pair
        /// (e.g., "supports_politeness", "supports_glossary", "supports_fused_translation")
        /// </summary>
        [JsonProperty("features")]
        public List<string> Features { get; set; } = new List<string>();
    }
}