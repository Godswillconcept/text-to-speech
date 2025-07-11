// TTS Configuration - Mirrors server-side configuration
export const ttsConfig = {
  // Available languages and their voice configurations
  languages: [
    {
      code: "ar-eg",
      name: "Arabic (Egypt)",
      voices: [{ id: "Oda", name: "Oda", gender: "Female", default: true }],
    },
    {
      code: "ar-sa",
      name: "Arabic (Saudi Arabia)",
      voices: [{ id: "Salim", name: "Salim", gender: "Male", default: true }],
    },
    {
      code: "bg-bg",
      name: "Bulgarian",
      voices: [{ id: "Dimo", name: "Dimo", gender: "Male", default: true }],
    },
    {
      code: "ca-es",
      name: "Catalan",
      voices: [{ id: "Rut", name: "Rut", gender: "Female", default: true }],
    },
    {
      code: "zh-cn",
      name: "Chinese (China)",
      voices: [
        { id: "Luli", name: "Luli", gender: "Female", default: true },
        { id: "Shu", name: "Shu", gender: "Female", default: false },
        { id: "Chow", name: "Chow", gender: "Female", default: false },
        { id: "Wang", name: "Wang", gender: "Male", default: false },
      ],
    },
    {
      code: "zh-hk",
      name: "Chinese (Hong Kong)",
      voices: [
        { id: "Jia", name: "Jia", gender: "Female", default: true },
        { id: "Xia", name: "Xia", gender: "Female", default: false },
        { id: "Chen", name: "Chen", gender: "Male", default: false },
      ],
    },
    {
      code: "zh-tw",
      name: "Chinese (Taiwan)",
      voices: [
        { id: "Akemi", name: "Akemi", gender: "Female", default: true },
        { id: "Lin", name: "Lin", gender: "Female", default: false },
        { id: "Lee", name: "Lee", gender: "Male", default: false },
      ],
    },
    {
      code: "hr-hr",
      name: "Croatian",
      voices: [{ id: "Nikola", name: "Nikola", gender: "Male", default: true }],
    },
    {
      code: "cs-cz",
      name: "Czech",
      voices: [{ id: "Josef", name: "Josef", gender: "Male", default: true }],
    },
    {
      code: "da-dk",
      name: "Danish",
      voices: [{ id: "Freja", name: "Freja", gender: "Female", default: true }],
    },
    {
      code: "nl-be",
      name: "Dutch (Belgium)",
      voices: [{ id: "Daan", name: "Daan", gender: "Male", default: true }],
    },
    {
      code: "nl-nl",
      name: "Dutch (Netherlands)",
      voices: [
        { id: "Lotte", name: "Lotte", gender: "Female", default: true },
        { id: "Bram", name: "Bram", gender: "Male", default: false },
      ],
    },
    {
      code: "en-au",
      name: "English (Australia)",
      voices: [
        { id: "Zoe", name: "Zoe", gender: "Female", default: true },
        { id: "Isla", name: "Isla", gender: "Female", default: false },
        { id: "Evie", name: "Evie", gender: "Female", default: false },
        { id: "Jack", name: "Jack", gender: "Male", default: false },
      ],
    },
    {
      code: "en-ca",
      name: "English (Canada)",
      voices: [
        { id: "Rose", name: "Rose", gender: "Female", default: true },
        { id: "Clara", name: "Clara", gender: "Female", default: false },
        { id: "Emma", name: "Emma", gender: "Female", default: false },
        { id: "Mason", name: "Mason", gender: "Male", default: false },
      ],
    },
    {
      code: "en-gb",
      name: "English (Great Britain)",
      voices: [
        { id: "Alice", name: "Alice", gender: "Female", default: true },
        { id: "Nancy", name: "Nancy", gender: "Female", default: false },
        { id: "Lily", name: "Lily", gender: "Female", default: false },
        { id: "Harry", name: "Harry", gender: "Male", default: false },
      ],
    },
    {
      code: "en-in",
      name: "English (India)",
      voices: [
        { id: "Eka", name: "Eka", gender: "Female", default: true },
        { id: "Jai", name: "Jai", gender: "Female", default: false },
        { id: "Ajit", name: "Ajit", gender: "Male", default: false },
      ],
    },
    {
      code: "en-ie",
      name: "English (Ireland)",
      voices: [{ id: "Oran", name: "Oran", gender: "Male", default: true }],
    },
    {
      code: "en-us",
      name: "English (United States)",
      voices: [
        { id: "Linda", name: "Linda", gender: "Female", default: true },
        { id: "Amy", name: "Amy", gender: "Female", default: false },
        { id: "Mary", name: "Mary", gender: "Female", default: false },
        { id: "John", name: "John", gender: "Male", default: false },
        { id: "Mike", name: "Mike", gender: "Male", default: false },
      ],
    },
    {
      code: "fi-fi",
      name: "Finnish",
      voices: [{ id: "Aada", name: "Aada", gender: "Female", default: true }],
    },
    {
      code: "fr-ca",
      name: "French (Canada)",
      voices: [
        { id: "Emile", name: "Emile", gender: "Female", default: true },
        { id: "Olivia", name: "Olivia", gender: "Female", default: false },
        { id: "Logan", name: "Logan", gender: "Female", default: false },
        { id: "Felix", name: "Felix", gender: "Male", default: false },
      ],
    },
    {
      code: "fr-fr",
      name: "French (France)",
      voices: [
        { id: "Bette", name: "Bette", gender: "Female", default: true },
        { id: "Iva", name: "Iva", gender: "Female", default: false },
        { id: "Zola", name: "Zola", gender: "Female", default: false },
        { id: "Axel", name: "Axel", gender: "Male", default: false },
      ],
    },
    {
      code: "fr-ch",
      name: "French (Switzerland)",
      voices: [{ id: "Theo", name: "Theo", gender: "Male", default: true }],
    },
    {
      code: "de-at",
      name: "German (Austria)",
      voices: [{ id: "Lukas", name: "Lukas", gender: "Male", default: true }],
    },
    {
      code: "de-de",
      name: "German (Germany)",
      voices: [
        { id: "Hanna", name: "Hanna", gender: "Female", default: true },
        { id: "Lina", name: "Lina", gender: "Female", default: false },
        { id: "Jonas", name: "Jonas", gender: "Male", default: false },
      ],
    },
    {
      code: "de-ch",
      name: "German (Switzerland)",
      voices: [{ id: "Tim", name: "Tim", gender: "Male", default: true }],
    },
    {
      code: "el-gr",
      name: "Greek",
      voices: [{ id: "Neo", name: "Neo", gender: "Male", default: true }],
    },
    {
      code: "he-il",
      name: "Hebrew",
      voices: [{ id: "Rami", name: "Rami", gender: "Male", default: true }],
    },
    {
      code: "hi-in",
      name: "Hindi",
      voices: [{ id: "Puja", name: "Puja", gender: "Female", default: true }],
    },
    {
      code: "hu-hu",
      name: "Hungarian",
      voices: [{ id: "Mate", name: "Mate", gender: "Male", default: true }],
    },
    {
      code: "id-id",
      name: "Indonesian",
      voices: [{ id: "Intan", name: "Intan", gender: "Male", default: true }],
    },
    {
      code: "it-it",
      name: "Italian",
      voices: [
        { id: "Bria", name: "Bria", gender: "Female", default: true },
        { id: "Mia", name: "Mia", gender: "Female", default: false },
        { id: "Pietro", name: "Pietro", gender: "Male", default: false },
      ],
    },
    {
      code: "ja-jp",
      name: "Japanese",
      voices: [
        { id: "Hina", name: "Hina", gender: "Female", default: true },
        { id: "Airi", name: "Airi", gender: "Female", default: false },
        { id: "Fumi", name: "Fumi", gender: "Female", default: false },
        { id: "Akira", name: "Akira", gender: "Male", default: false },
      ],
    },
    {
      code: "ko-kr",
      name: "Korean",
      voices: [{ id: "Nari", name: "Nari", gender: "Female", default: true }],
    },
    {
      code: "ms-my",
      name: "Malay",
      voices: [{ id: "Aqil", name: "Aqil", gender: "Male", default: true }],
    },
    {
      code: "nb-no",
      name: "Norwegian",
      voices: [{ id: "Marte", name: "Marte", gender: "Female", default: true }],
    },
    {
      code: "pl-pl",
      name: "Polish",
      voices: [{ id: "Julia", name: "Julia", gender: "Female", default: true }],
    },
    {
      code: "pt-br",
      name: "Portuguese (Brazil)",
      voices: [
        { id: "Marcia", name: "Marcia", gender: "Female", default: true },
        { id: "Ligia", name: "Ligia", gender: "Female", default: false },
        { id: "Yara", name: "Yara", gender: "Female", default: false },
        { id: "Dinis", name: "Dinis", gender: "Male", default: false },
      ],
    },
    {
      code: "pt-pt",
      name: "Portuguese (Portugal)",
      voices: [
        { id: "Leonor", name: "Leonor", gender: "Female", default: true },
      ],
    },
    {
      code: "ro-ro",
      name: "Romanian",
      voices: [{ id: "Doru", name: "Doru", gender: "Male", default: true }],
    },
    {
      code: "ru-ru",
      name: "Russian",
      voices: [
        { id: "Olga", name: "Olga", gender: "Female", default: true },
        { id: "Marina", name: "Marina", gender: "Female", default: false },
        { id: "Peter", name: "Peter", gender: "Male", default: false },
      ],
    },
    {
      code: "sk-sk",
      name: "Slovak",
      voices: [{ id: "Beda", name: "Beda", gender: "Male", default: true }],
    },
    {
      code: "sl-si",
      name: "Slovenian",
      voices: [{ id: "Vid", name: "Vid", gender: "Male", default: true }],
    },
    {
      code: "es-mx",
      name: "Spanish (Mexico)",
      voices: [
        { id: "Juana", name: "Juana", gender: "Female", default: true },
        { id: "Silvia", name: "Silvia", gender: "Female", default: false },
        { id: "Teresa", name: "Teresa", gender: "Female", default: false },
        { id: "Jose", name: "Jose", gender: "Male", default: false },
      ],
    },
    {
      code: "es-es",
      name: "Spanish (Spain)",
      voices: [
        { id: "Camila", name: "Camila", gender: "Female", default: true },
        { id: "Sofia", name: "Sofia", gender: "Female", default: false },
        { id: "Luna", name: "Luna", gender: "Female", default: false },
        { id: "Diego", name: "Diego", gender: "Male", default: false },
      ],
    },
    {
      code: "sv-se",
      name: "Swedish",
      voices: [{ id: "Molly", name: "Molly", gender: "Female", default: true }],
    },
    {
      code: "ta-in",
      name: "Tamil",
      voices: [{ id: "Sai", name: "Sai", gender: "Male", default: true }],
    },
    {
      code: "th-th",
      name: "Thai",
      voices: [{ id: "Ukrit", name: "Ukrit", gender: "Male", default: true }],
    },
    {
      code: "tr-tr",
      name: "Turkish",
      voices: [{ id: "Omer", name: "Omer", gender: "Male", default: true }],
    },
    {
      code: "vi-vn",
      name: "Vietnamese",
      voices: [{ id: "Chi", name: "Chi", gender: "Male", default: true }],
    },
  ],

  // Get available voices for a specific language
  getVoices: function (languageCode) {
    const lang = this.languages.find((lang) => lang.code === languageCode);
    return lang ? lang.voices : [];
  },

  // Audio formats with enhanced descriptions
  formats: [
    { code: "8khz_8bit_mono", description: "8 kHz, 8 Bit, Mono" },
    { code: "8khz_8bit_stereo", description: "8 kHz, 8 Bit, Stereo" },
    { code: "8khz_16bit_mono", description: "8 kHz, 16 Bit, Mono" },
    { code: "8khz_16bit_stereo", description: "8 kHz, 16 Bit, Stereo" },
    { code: "11khz_8bit_mono", description: "11 kHz, 8 Bit, Mono" },
    { code: "11khz_8bit_stereo", description: "11 kHz, 8 Bit, Stereo" },
    { code: "11khz_16bit_mono", description: "11 kHz, 16 Bit, Mono" },
    { code: "11khz_16bit_stereo", description: "11 kHz, 16 Bit, Stereo" },
    { code: "12khz_8bit_mono", description: "12 kHz, 8 Bit, Mono" },
    { code: "12khz_8bit_stereo", description: "12 kHz, 8 Bit, Stereo" },
    { code: "12khz_16bit_mono", description: "12 kHz, 16 Bit, Mono" },
    { code: "12khz_16bit_stereo", description: "12 kHz, 16 Bit, Stereo" },
    { code: "16khz_8bit_mono", description: "16 kHz, 8 Bit, Mono" },
    { code: "16khz_8bit_stereo", description: "16 kHz, 8 Bit, Stereo" },
    { code: "16khz_16bit_mono", description: "16 kHz, 16 Bit, Mono" },
    { code: "16khz_16bit_stereo", description: "16 kHz, 16 Bit, Stereo" },
    { code: "22khz_8bit_mono", description: "22 kHz, 8 Bit, Mono" },
    { code: "22khz_8bit_stereo", description: "22 kHz, 8 Bit, Stereo" },
    { code: "22khz_16bit_mono", description: "22 kHz, 16 Bit, Mono" },
    { code: "22khz_16bit_stereo", description: "22 kHz, 16 Bit, Stereo" },
    { code: "24khz_8bit_mono", description: "24 kHz, 8 Bit, Mono" },
    { code: "24khz_8bit_stereo", description: "24 kHz, 8 Bit, Stereo" },
    { code: "24khz_16bit_mono", description: "24 kHz, 16 Bit, Mono" },
    { code: "24khz_16bit_stereo", description: "24 kHz, 16 Bit, Stereo" },
    { code: "32khz_8bit_mono", description: "32 kHz, 8 Bit, Mono" },
    { code: "32khz_8bit_stereo", description: "32 kHz, 8 Bit, Stereo" },
    { code: "32khz_16bit_mono", description: "32 kHz, 16 Bit, Mono" },
    { code: "32khz_16bit_stereo", description: "32 kHz, 16 Bit, Stereo" },
    { code: "44khz_8bit_mono", description: "44 kHz, 8 Bit, Mono" },
    { code: "44khz_8bit_stereo", description: "44 kHz, 8 Bit, Stereo" },
    { code: "44khz_16bit_mono", description: "44 kHz, 16 Bit, Mono" },
    { code: "44khz_16bit_stereo", description: "44 kHz, 16 Bit, Stereo" },
    { code: "48khz_8bit_mono", description: "48 kHz, 8 Bit, Mono" },
    { code: "48khz_8bit_stereo", description: "48 kHz, 8 Bit, Stereo" },
    { code: "48khz_16bit_mono", description: "48 kHz, 16 Bit, Mono" },
    { code: "48khz_16bit_stereo", description: "48 kHz, 16 Bit, Stereo" },
    { code: "alaw_8khz_mono", description: "ALaw, 8 kHz, Mono" },
    { code: "alaw_8khz_stereo", description: "ALaw, 8 kHz, Stereo" },
    { code: "alaw_11khz_mono", description: "ALaw, 11 kHz, Mono" },
    { code: "alaw_11khz_stereo", description: "ALaw, 11 kHz, Stereo" },
    { code: "alaw_22khz_mono", description: "ALaw, 22 kHz, Mono" },
    { code: "alaw_22khz_stereo", description: "ALaw, 22 kHz, Stereo" },
    { code: "alaw_44khz_mono", description: "ALaw, 44 kHz, Mono" },
    { code: "alaw_44khz_stereo", description: "ALaw, 44 kHz, Stereo" },
    { code: "ulaw_8khz_mono", description: "uLaw, 8 kHz, Mono" },
    { code: "ulaw_8khz_stereo", description: "uLaw, 8 kHz, Stereo" },
    { code: "ulaw_11khz_mono", description: "uLaw, 11 kHz, Mono" },
    { code: "ulaw_11khz_stereo", description: "uLaw, 11 kHz, Stereo" },
    { code: "ulaw_22khz_mono", description: "uLaw, 22 kHz, Mono" },
    { code: "ulaw_22khz_stereo", description: "uLaw, 22 kHz, Stereo" },
    { code: "ulaw_44khz_mono", description: "uLaw, 44 kHz, Mono" },
    { code: "ulaw_44khz_stereo", description: "uLaw, 44 kHz, Stereo" },
  ],

  // Audio codecs
  codecs: ["MP3", "WAV", "AAC", "OGG", "CAF"],

  // Rate options (-10 to 10)
  rates: [-10, -5, 0, 5, 10],

  // Base64 encoding option
  base64: [true, false],

  // Default values
  defaults: {
    voice: "en-us",
    speed: 0,
    format: "16khz_16bit_stereo",
    codec: "MP3",
    base64: false,
  },

  // Helper function to get format display name
  getFormatDisplayName: (formatCode) => {
    const format = ttsConfig.formats.find((f) => f.code === formatCode);
    return format ? format.description : formatCode;
  },

  // Helper function to get voice display name
  getVoiceDisplayName: function (voiceId, languageCode) {
    if (!voiceId || !languageCode) return "Default Voice";

    const lang = this.languages.find((l) => l.code === languageCode);
    if (!lang || !lang.voices) return "Default Voice";

    const voice = lang.voices.find((v) => v.id === voiceId);
    if (!voice) return "Default Voice";

    return `${voice.name} (${voice.gender})`;
  },

  // Get default voice for a language
  getDefaultVoice: function (languageCode) {
    const voices = this.getVoices(languageCode);
    const defaultVoice = voices.find((v) => v.default);
    return defaultVoice
      ? defaultVoice.id
      : voices.length > 0
      ? voices[0].id
      : "Linda";
  },

  // Get all format codes (for backward compatibility)
  getFormatCodes: function () {
    return this.formats.map((f) => f.code);
  },

  // Get language by code
  getLanguage: function (languageCode) {
    return this.languages.find((lang) => lang.code === languageCode);
  },

  // Get all language codes
  getLanguageCodes: function () {
    return this.languages.map((lang) => lang.code);
  },
};

export default ttsConfig;
