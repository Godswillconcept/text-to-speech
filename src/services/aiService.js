const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ApiError } = require('../middleware/errorHandler');

// Initialize Google Gemini AI
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
} catch (error) {
  console.error('Failed to initialize Google Generative AI:', error);
  console.warn('AI text manipulation features will be disabled. Set GOOGLE_AI_API_KEY to enable.');
}

/**
 * Generate text using Google's Gemini AI
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Additional options for text generation
 * @param {number} [options.maxOutputTokens=2048] - Maximum number of tokens to generate
 * @param {number} [options.temperature=0.7] - Controls randomness (0.0 to 1.0)
 * @returns {Promise<string>} - The generated text
 */
const generateText = async (prompt, { maxOutputTokens = 2048, temperature = 0.7 } = {}) => {
  if (!genAI) {
    throw new ApiError(500, 'AI service is not configured');
  }

  try {
    // Get the Gemini Pro model
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
    console.error('Error in generateText:', error);
    throw new ApiError(500, 'Failed to generate text with AI');
  }
};

/**
 * Paraphrase the given text
 * @param {string} text - The text to paraphrase
 * @param {Object} options - Options for paraphrasing
 * @param {string} [options.tone='neutral'] - The tone to use (e.g., 'formal', 'casual', 'professional')
 * @param {string} [options.complexity='maintain'] - The complexity level ('simplify', 'maintain', 'enhance')
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

module.exports = {
  generateText,
  paraphraseText,
  summarizeText,
  extractKeyPoints,
  changeTone
};
