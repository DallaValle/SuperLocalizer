using System.Collections.Generic;
using Newtonsoft.Json;

namespace SuperLocalizer.Model
{
    /// <summary>
    /// Response model for Supertext AI translation API
    /// </summary>
    public class TranslateResponse
    {
        /// <summary>
        /// Array of translated text strings
        /// </summary>
        [JsonProperty("translated_text")]
        public List<string> TranslatedText { get; set; } = new List<string>();

        /// <summary>
        /// Source language used for translation
        /// </summary>
        [JsonProperty("detected_source_lang")]
        public string SourceLang { get; set; }
    }
}