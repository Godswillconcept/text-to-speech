const textToSpeech = require('@google-cloud/text-to-speech');
const { ApiError } = require('../middleware/errorHandler');

// Initialize Google Cloud TTS client
let client;
try {
  client = new textToSpeech.TextToSpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
} catch (error) {
  console.error('Failed to initialize Google TTS client:', error);
  console.warn('TTS functionality will be disabled. Set GOOGLE_APPLICATION_CREDENTIALS to enable.');
}

// Cache for available voices
let voicesCache = [];
let voicesCacheExpiry = 0;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Convert text to speech using Google Cloud TTS
 * @param {string} text - The text to convert to speech
 * @param {Object} options - Options for the TTS
 * @param {string} options.voice - The voice to use (e.g., 'en-US-Wavenet-D')
 * @param {string} [options.language='en-US'] - The language code
 * @param {number} [options.speed=1.0] - Speaking rate/speed (0.25 - 4.0)
 * @returns {Promise<Buffer>} - The audio buffer
 */
const convertTextToSpeech = async (text, { voice, language = 'en-US', speed = 1.0 }) => {
  if (!client) {
    throw new ApiError(500, 'TTS service is not configured');
  }

  if (!text || !voice) {
    throw new ApiError(400, 'Text and voice are required');
  }

  // Limit text length to 5000 characters (Google's limit is 5000 for standard voices)
  const textToProcess = text.length > 5000 ? text.substring(0, 5000) : text;

  // Configure the request
  const request = {
    input: { text: textToProcess },
    voice: {
      languageCode: language,
      name: voice
    },
    audioConfig: {
      audioEncoding: 'MP3', // or 'LINEAR16' for WAV
      speakingRate: Math.max(0.25, Math.min(4.0, parseFloat(speed) || 1.0)),
      pitch: 0, // -20.0 to 20.0
      volumeGainDb: 0, // -96.0 to 16.0
      effectsProfileId: ['small-bluetooth-speaker-class-device'] // Optional: audio profile
    }
  };

  try {
    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    
    // Return the audio content as a Buffer
    return Buffer.from(response.audioContent, 'base64');
  } catch (error) {
    console.error('Error in textToSpeech:', error);
    throw new ApiError(500, 'Failed to generate speech from text');
  }
};

/**
 * Get available voices from Google Cloud TTS
 * @param {boolean} [forceRefresh=false] - Force refresh the cache
 * @returns {Promise<Array>} - Array of available voices
 */
const getAvailableVoices = async (forceRefresh = false) => {
  // Return cached voices if available and not expired
  const now = Date.now();
  if (!forceRefresh && voicesCache.length > 0 && now < voicesCacheExpiry) {
    return voicesCache;
  }

  if (!client) {
    throw new ApiError(500, 'TTS service is not configured');
  }

  try {
    const [result] = await client.listVoices({});
    
    // Process and cache the voices
    voicesCache = result.voices.map(voice => ({
      name: voice.name,
      languageCode: voice.languageCodes[0],
      gender: voice.ssmlGender,
      naturalSampleRateHertz: voice.naturalSampleRateHertz
    }));
    
    // Set cache expiry
    voicesCacheExpiry = now + CACHE_DURATION_MS;
    
    return voicesCache;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw new ApiError(500, 'Failed to fetch available voices');
  }
};

/**
 * Get voices filtered by language code
 * @param {string} languageCode - The language code to filter by (e.g., 'en-US')
 * @returns {Promise<Array>} - Filtered array of voices
 */
const getVoicesByLanguage = async (languageCode) => {
  const voices = await getAvailableVoices();
  return voices.filter(voice => 
    voice.languageCode.toLowerCase().startsWith(languageCode.toLowerCase())
  );
};

module.exports = {
  convertTextToSpeech,
  getAvailableVoices,
  getVoicesByLanguage
};
