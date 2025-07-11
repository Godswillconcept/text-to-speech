const axios = require("axios");
const { ApiError } = require("../middleware/errorHandler");
const ttsConfig = require("../config/ttsConfig");

// VoiceRSS API Configuration
const VOICE_RSS_API_URL = "http://api.voicerss.org/";
const API_KEY = process.env.VOICE_RSS_API_KEY;

// Cache for available voices
let voicesCache = [];

// Voice data from the configuration
// For now, we'll create a simple mapping of language codes to default voices
// In a real implementation, you would want to define specific voices per language
const VOICES = ttsConfig.languages.map((lang) => ({
  languageCode: lang.code,
  name: `${lang.code}-default`,
  displayName: `Default (${lang.name})`,
  description: `Default voice for ${lang.name}`,
  gender: "unknown",
  isDefault: true,
}));

// Add some common specific voices
VOICES.push(
  // English voices
  {
    languageCode: "en-us",
    name: "en-us-linda",
    displayName: "Linda",
    description: "Linda (English US)",
    gender: "female",
    isDefault: true,
  },
  {
    languageCode: "en-us",
    name: "en-us-mike",
    displayName: "Mike",
    description: "Mike (English US)",
    gender: "male",
    isDefault: false,
  },
  // Add more voices as needed
  {
    languageCode: "en-gb",
    name: "en-gb-george",
    displayName: "George",
    description: "George (English UK)",
    gender: "male",
    isDefault: true,
  }
);

/**
 * Convert text to speech using VoiceRSS API
 * @param {string} text - The text to convert to speech
 * @param {Object} options - Options for the TTS
 * @param {string} [options.voice] - The voice to use (e.g., 'en-us-john')
 * @param {string} [options.language] - The language code (e.g., 'en-us')
 * @param {number} [options.speed=0] - Speaking rate (-10 to 10, 0 is normal speed)
 * @param {string} [options.format] - Audio format (e.g., '16khz_16bit_stereo')
 * @param {string} [options.codec='MP3'] - Audio codec (MP3, WAV, AAC, OGG, CAF)
 * @param {boolean} [options.base64=false] - Whether to return base64 encoded audio
 * @returns {Promise<Buffer|string>} - The audio buffer or base64 string
 * @throws {ApiError} If the request fails or validation fails
 */
const convertTextToSpeech = async (
  text,
  {
    voice,
    language,
    speed = ttsConfig.defaults.speed,
    format = ttsConfig.defaults.format,
    codec = ttsConfig.defaults.codec,
    base64 = ttsConfig.defaults.base64,
  } = {}
) => {
  console.log("TTS Service - Starting conversion with options:", {
    textLength: text?.length || 0,
    voice,
    language,
    speed,
    format,
    codec,
    base64,
  });

  if (!API_KEY) {
    const error = new ApiError(500, "VoiceRSS API key is not configured");
    console.error("TTS Service Error - Missing API Key");
    throw error;
  }

  if (!text || typeof text !== "string" || text.trim() === "") {
    const error = new ApiError(
      400,
      "Text is required and must be a non-empty string"
    );
    console.error("TTS Service Error - Invalid text input:", { text });
    throw error;
  }

  // Validate format
  const formatValid = ttsConfig.audioFormats.some((f) => f.code === format);
  if (!formatValid) {
    const error = new ApiError(
      400,
      `Unsupported audio format. Must be one of: ${ttsConfig.audioFormats.map((f) => f.code).join(", ")}`
    );
    console.error("TTS Service Error - Invalid format:", {
      providedFormat: format,
      validFormats: ttsConfig.audioFormats.map((f) => f.code),
    });
    throw error;
  }

  // Validate codec
  if (!ttsConfig.codecs.includes(codec)) {
    const error = new ApiError(
      400,
      `Unsupported codec. Must be one of: ${ttsConfig.codecs.join(", ")}`
    );
    console.error("TTS Service Error - Invalid codec:", {
      providedCodec: codec,
      validCodecs: ttsConfig.codecs,
    });
    throw error;
  }

  // Validate speed
  if (speed < -10 || speed > 10) {
    const error = new ApiError(400, "Speed must be between -10 and 10");
    console.error("TTS Service Error - Invalid speed:", { speed });
    throw error;
  }

  // Determine voice to use
  let voiceToUse = voice || language || ttsConfig.defaults.voice;
  let languageCode = voiceToUse;
  let voiceName = "";

  console.log("TTS Service - Voice selection:", {
    voiceToUse,
    voice,
    language,
    defaultVoice: ttsConfig.defaults.voice,
  });

  // If we have a voice in format 'lang-code-voice', extract the parts
  if (voiceToUse.includes("-")) {
    const parts = voiceToUse.split("-");
    if (parts.length >= 3) {
      // Format is 'en-us-voicename'
      languageCode = `${parts[0]}-${parts[1]}`;
      voiceName = parts.slice(2).join("-");
    } else if (parts.length === 2) {
      // Format is 'en-us' (just language code)
      languageCode = voiceToUse;
    }
  }

  // Validate the language code
  const langMatch = ttsConfig.languages.find(
    (lang) => lang.code === languageCode
  );
  if (!langMatch) {
    const error = new ApiError(
      400,
      `Unsupported language code: ${languageCode}`
    );
    console.error("TTS Service Error - Unsupported language:", {
      providedLanguage: languageCode,
      supportedLanguages: ttsConfig.languages.map((l) => l.code),
    });
    throw error;
  }

  // Limit text length to 1000 characters (VoiceRSS limit for free tier)
  const textToProcess = text.length > 1000 ? text.substring(0, 1000) : text;
  console.log(
    "TTS Service - Processing text (truncated to 1000 chars):",
    textToProcess.length === text.length ? "No" : "Yes"
  );

  try {
    const params = new URLSearchParams();
    params.append("key", API_KEY);
    params.append("src", textToProcess);
    params.append("hl", languageCode); // Language code (e.g., 'en-us')

    // Add voice name if specified (e.g., 'linda')
    if (voiceName) {
      params.append("v", voiceName);
    }

    // Add other parameters
    params.append("r", speed.toString());
    params.append("c", codec);
    params.append("f", format);
    if (base64) {
      params.append("b64", "true");
    }

    console.log("TTS Service - Sending request to VoiceRSS API:", {
      url: VOICE_RSS_API_URL,
      params: Object.fromEntries(params),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "audio/mpeg",
      },
    });

    const response = await axios.post(VOICE_RSS_API_URL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "audio/mpeg",
      },
      responseType: "arraybuffer",
      validateStatus: () => true, // Don't throw on HTTP error status codes
    });

    console.log("TTS Service - Received response from VoiceRSS API:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      dataLength: response.data?.length || 0,
    });

    // Check if response is an error message
    let responseData;
    try {
      responseData = response.data.toString();
      if (responseData.startsWith("ERROR")) {
        const error = new Error(`VoiceRSS API error: ${responseData}`);
        console.error("TTS Service - VoiceRSS API Error:", responseData);
        throw error;
      }
    } catch (e) {
      // If we can't parse as text, it's probably binary audio data
      if (response.status >= 200 && response.status < 300) {
        console.log("TTS Service - Successfully received audio data");
        return Buffer.from(response.data);
      }
      throw e;
    }

    // If we got here, the response should be valid audio data
    console.log("TTS Service - Successfully converted text to speech");
    return Buffer.from(response.data);
  } catch (error) {
    console.error("TTS Service - Error in VoiceRSS text-to-speech:", {
      message: error.message,
      stack: error.stack,
      response: error.response
        ? {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data
              ? error.response.data.toString().substring(0, 200) + "..."
              : "No data",
          }
        : "No response",
      request: error.request
        ? "Request was made but no response received"
        : "No request was made",
    });

    let errorMessage = error.message;
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "Invalid or missing VoiceRSS API key";
      } else if (error.response.status === 400) {
        errorMessage = "Invalid request to VoiceRSS API";
      } else if (error.response.status >= 500) {
        errorMessage = "VoiceRSS API server error";
      }
    }

    throw new ApiError(
      error.response?.status || 500,
      `Failed to generate speech: ${errorMessage}`
    );
  }
};

/**
 * Get available voices from VoiceRSS
 * @param {boolean} [forceRefresh=false] - Whether to force refresh the cache
 * @returns {Promise<Array>} - Array of available voices with full details
 */
const getAvailableVoices = async (forceRefresh = false) => {
  if (voicesCache.length === 0 || forceRefresh) {
    // Add any additional processing here if needed
    voicesCache = [...VOICES];
  }
  return voicesCache;
};

/**
 * Get voices filtered by language code
 * @param {string} languageCode - The language code to filter by (e.g., 'en')
 * @returns {Promise<Array>} - Filtered array of voices
 */
const getVoicesByLanguage = async (languageCode) => {
  const voices = await getAvailableVoices();
  return voices.filter((voice) =>
    voice.languageCode.toLowerCase().startsWith(languageCode.toLowerCase())
  );
};

module.exports = {
  convertTextToSpeech,
  getAvailableVoices,
  getVoicesByLanguage,
};