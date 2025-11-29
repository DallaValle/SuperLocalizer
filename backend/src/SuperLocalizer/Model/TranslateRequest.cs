using System.Collections.Generic;
using Newtonsoft.Json;

namespace SuperLocalizer.Model
{
    /// <summary>
    /// Request model for Supertext AI translation API
    /// </summary>
    public class TranslateRequest
    {
        /// <summary>
        /// Array of text strings to translate
        /// </summary>
        [JsonProperty("text")]
        public List<string> Text { get; set; } = new List<string>();

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
    }
}