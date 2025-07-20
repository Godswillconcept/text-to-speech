const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ApiError } = require('../middleware/errorHandler');

// Track if AI is available
let isAIAvailable = false;
let genAI;

// Initialize Google Gemini AI if API key is available
const initAIService = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_AI_API_KEY is not set. AI features will be disabled.');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    isAIAvailable = true;
    console.log('Google Generative AI service initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Google Generative AI:', error);
    console.warn('AI text manipulation features will be disabled.');
    return false;
  }
};

// Initialize on require
initAIService();

/**
 * Check if AI service is available
 * @returns {boolean} True if AI service is available
 */
const isAIServiceAvailable = () => isAIAvailable;

/**
 * Generate text using Google's Gemini AI
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Additional options for text generation
 * @param {number} [options.maxOutputTokens=2048] - Maximum number of tokens to generate
 * @param {number} [options.temperature=0.7] - Controls randomness (0.0 to 1.0)
 * @param {number} [options.retries=2] - Number of retry attempts for rate limits
 * @returns {Promise<string>} - The generated text
 */
const generateText = async (prompt, { 
  maxOutputTokens = 2048, 
  temperature = 0.7,
  retries = 2 
} = {}) => {
  if (!isAIAvailable) {
    throw new ApiError(503, 'AI service is currently unavailable. Please check your API key and try again.');
  }

  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Generate content
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens,
          temperature: Math.max(0, Math.min(1, temperature)),
          topP: 0.95,
          topK: 40
        }
      });

      // Get the response text
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      
      // If it's a rate limit or service unavailable error, wait and retry
      if ((error.status === 429 || error.status === 503) && attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      // If we've exhausted retries or it's a different error, break the loop
      break;
    }
  }

  // If we get here, all retries failed
  console.error('All retry attempts failed:', lastError);
  
  // Provide more specific error messages based on the error type
  if (lastError.status === 429) {
    throw new ApiError(429, 'AI service is currently experiencing high traffic. Please try again in a few moments.');
  } else if (lastError.status === 503) {
    throw new ApiError(503, 'AI service is temporarily unavailable. Please try again later.');
  } else {
    throw new ApiError(500, `Failed to generate text with AI: ${lastError.message || 'Unknown error'}`);
  }
};

/**
 * Paraphrase the given text
 * @param {string} text - The text to paraphrase
 * @param {Object} options - Options for paraphrasing
 * @param {'standard'|'neutral'|'formal'|'casual'|'friendly'|'professional'|'academic'|'business'} [options.tone='neutral'] - The tone to use for paraphrasing
 * @param {'simplify'|'maintain'|'enhance'} [options.complexity='maintain'] - The complexity level
 * @returns {Promise<string>} - The paraphrased text
 */
const paraphraseText = async (text, { tone = 'neutral', complexity = 'maintain' } = {}) => {
  const prompt = `Paraphrase the following text with a ${tone} tone and ${complexity} complexity. 
Only respond with the paraphrased text, nothing else.\n\nText: "${text}"`;
  
  return await generateText(prompt, {
    temperature: 0.7,
    maxOutputTokens: 2048
  });
};

/**
 * Summarize the given text
 * @param {string} text - The text to summarize
 * @param {Object} options - Options for summarization
 * @param {string} [options.format='paragraph'] - The format of the summary ('paragraph', 'bullet', 'concise')
 * @param {number} [options.length=3] - The desired length of the summary (1-6, where 1 is shortest)
 * @returns {Promise<string>} - The summarized text
 */
const summarizeText = async (text, { format = 'paragraph', length = 3 } = {}) => {
  const lengthMap = {
    1: 'one sentence',
    2: 'a short paragraph',
    3: 'a medium-length summary',
    4: 'a detailed summary',
    5: 'a very detailed summary',
    6: 'a summary of the most important paragraphs'
  };

  const prompt = `Please provide ${lengthMap[Math.min(6, Math.max(1, length))]} of the following text in ${format} format. 
Only respond with the summary, nothing else.\n\nText: "${text}"`;
  
  return await generateText(prompt, {
    temperature: 0.3, // Lower temperature for more focused summaries
    maxOutputTokens: 1024
  });
};

/**
 * Extract key points from the given text
 * @param {string} text - The text to extract key points from
 * @param {Object} options - Options for key point extraction
 * @param {number} [options.count=5] - The number of key points to extract
 * @returns {Promise<Array<string>>} - Array of key points
 */
const extractKeyPoints = async (text, { count = 5 } = {}) => {
  const prompt = `Extract ${count} key points from the following text. Return each point on a new line with a bullet point (-).\n\nText: "${text}"`;
  
  const result = await generateText(prompt, {
    temperature: 0.2,
    maxOutputTokens: 1024
  });
  
  // Parse the result into an array of points
  return result
    .split('\n')
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(line => line.length > 0);
};

/**
 * Change the tone of the given text
 * @param {string} text - The text to modify
 * @param {string} targetTone - The target tone (e.g., 'formal', 'casual', 'professional', 'friendly')
 * @returns {Promise<string>} - The modified text with the new tone
 */
const changeTone = async (text, targetTone) => {
  const prompt = `Rewrite the following text with a ${targetTone} tone. Only respond with the rewritten text, nothing else.\n\nText: "${text}"`;
  
  return await generateText(prompt, {
    temperature: 0.7,
    maxOutputTokens: 2048
  });
};

// Clean up on process exit
process.on('exit', () => {
  // Clean up any resources if needed
  isAIAvailable = false;
  genAI = null;
});

module.exports = {
  generateText,
  paraphraseText,
  summarizeText,
  extractKeyPoints,
  changeTone,
  isAIServiceAvailable,
  initAIService
};
