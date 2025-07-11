// Base URL for API requests - Don't include /api here as it's added in the endpoints
// Ensure the base URL doesn't end with a trailing slash
const getApiBaseUrl = () => {
  let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  // Remove any trailing slashes
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  return baseUrl;
};

const API_BASE_URL = getApiBaseUrl();
import { API_ENDPOINTS } from './constants';

// Authentication API functions
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }
  
  return response.json();
};

export const signupUser = async (userInfo) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInfo),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }
  
  return response.json();
};

// Helper to handle responses and errors consistently
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response;
};

// Function for TextToSpeech.jsx
export const textToSpeech = async (options) => { // Expects { text, voice, rate, pitch, format, codec, base64 }
  // Clean up the base URL
  let baseUrl = API_BASE_URL;
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  // Clean up the endpoint
  let endpoint = 'api/tts/text-to-speech';
  while (endpoint.startsWith('/')) {
    endpoint = endpoint.substring(1);
  }
  
  // Construct the final URL
  const url = `${baseUrl}/${endpoint}`;
  console.log('TTS Request URL:', url); // Debug log
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      credentials: 'include',
      body: JSON.stringify({
        text: options.text,
        voice: options.voice,
        speed: options.rate || options.speed,
        pitch: options.pitch,
        format: options.format || 'mp3',
        codec: options.codec || 'libmp3lame',
        base64: options.base64 || false
      }),
    });
    
    const data = await handleResponse(response);
    const result = await data.json();
    console.log('TTS Response:', result);
    
    return result.audioUrl;
  } catch (error) {
    console.error('TTS Error:', error);
    throw error;
  }
};

// Function for PDF to speech conversion
export const pdfToSpeech = async (formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', `${API_BASE_URL}/pdf-to-speech`, true);
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event);
      }
    };
    
    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = new Blob([xhr.response], { type: xhr.getResponseHeader('content-type') });
        resolve(blob);
      } else {
        const error = new Error(`Request failed with status ${xhr.status}`);
        try {
          const errorData = JSON.parse(xhr.responseText);
          error.message = errorData.message || error.message;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        reject(error);
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Network error occurred'));
    };
    
    xhr.responseType = 'blob';
    xhr.send(formData);
  });
};

// Function for ParaphraserPage.jsx
export const paraphraseText = async (options) => { // Expects { text, tone }
  const response = await fetch(`${API_BASE_URL}/api/ai/paraphrase`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    credentials: 'include',
    body: JSON.stringify({
      text: options.text,
      tone: options.tone || 'neutral',
      complexity: 'maintain' // Default complexity
    }),
  });
  
  const data = await handleResponse(response);
  const result = await data.json();
  return result;
};

// Function for text summarization
export const summarizeText = async (options) => { // Expects { text, format, length }
  const response = await fetch(`${API_BASE_URL}/api/ai/summarize`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    credentials: 'include',
    body: JSON.stringify({
      text: options.text,
      format: options.format || 'paragraph',
      length: options.length || 3
    }),
  });
  
  const data = await handleResponse(response);
  const result = await data.json();
  return { summary: result.result }; // Map the backend response to expected frontend format
};

/**
 * Fetches operations with pagination and filtering
 * @param {Object} options - Options for fetching operations
 * @param {number} options.page - Page number (1-based)
 * @param {number} options.limit - Number of items per page
 * @param {string} options.type - Filter by operation type
 * @param {string} options.search - Search query to filter operations
 * @returns {Promise<{data: Array, pagination: Object}>} - Operations and pagination info
 */
export const getOperations = async ({ page = 1, limit = 10, type, search } = {}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (type && type !== 'all') {
      params.append('type', type);
    }
    if (search) {
      params.append('search', search);
    }

    // Construct the URL with the correct API path
    const basePath = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    const endpoint = 'api/operations';
    const queryString = params.toString();
    // Ensure we don't have double slashes between basePath and endpoint
    const url = `${basePath}${endpoint}${queryString ? `?${queryString}` : ''}`;
    console.log('Fetching operations from:', url);
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No authentication token found');
      // Redirect to login or handle missing token appropriately
      window.location.href = '/login';
      return;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        error: errorText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Operations API Response:', data);
    return data;
  } catch (error) {
    console.error('Error in getOperations:', {
      error,
      message: error.message,
      stack: error.stack
    });
    throw error; // Re-throw to be handled by the caller
  }
};

// Function to delete an operation
export const deleteOperation = async (id) => {
  const response = await fetch(`${API_BASE_URL}/operations/${id}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
  return response.json();
};

/**
 * Summarizes the text content of an uploaded PDF file.
 * @param {FormData} formData - The form data containing the PDF file and any options.
 * @returns {Promise<{summary: string}>} The summary result.
 */
export const summarizePdf = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/doc/summarize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      credentials: 'include',
      body: formData,
    });
    
    const data = await handleResponse(response);
    const result = await data.json();
    
    // The backend returns the summary in the 'text' field for document operations
    if (result && typeof result.text === 'string') {
      return { summary: result.text };
    }
    
    // Handle case where the response format is unexpected
    throw new Error('Unexpected response format from server');
  } catch (error) {
    console.error('Error in summarizePdf:', error);
    throw error; // Re-throw to allow error handling in the component
  }
};

/**
 * Paraphrases the text content of an uploaded document.
 * @param {FormData} formData - The form data containing the document file and options.
 * @returns {Promise<object>} The paraphrased text result.
 */
export const paraphrasePdf = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/api/ai/doc/paraphrase`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    credentials: 'include',
    body: formData,
  });
  
  const data = await handleResponse(response);
  const result = await data.json();
  return result;
};

/**
 * Extracts key points from a given text.
 * @param {object} options - Contains the text to process. e.g., { text }
 * @returns {Promise<{keyPoints: string[]}>} An object containing an array of key points.
 */
export const getKeyPointsFromText = async (options) => {
  const response = await fetch(`${API_BASE_URL}/key-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  await handleResponse(response);
  return response.json();
};

/**
 * Extracts key points from an uploaded PDF file.
 * @param {FormData} formData - The form data containing the PDF file.
 * @returns {Promise<{keyPoints: string[]}>} An object containing an array of key points.
 */
export const getKeyPointsFromPdf = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/key-points-pdf`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(response);
  return response.json();
};

/**
 * Changes the tone of a given text.
 * @param {object} options - Contains the text and desired tone. e.g., { text, tone }
 * @returns {Promise<{result: string}>} An object containing the text with the new tone.
 */
export const changeToneOfText = async (options) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/change-tone`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify({
      text: options.text,
      tone: options.tone
    }),
  });
  
  const data = await handleResponse(response);
  const result = await data.json();
  return { tonedText: result.result };
};

/**
 * Changes the tone of an uploaded document's content.
 * @param {FormData} formData - The form data containing the document file and tone.
 * @returns {Promise<{result: string}>} An object containing the text with the new tone.
 */
export const changeToneOfPdf = async (formData) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/doc/change-tone`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    body: formData,
  });
  
  const data = await handleResponse(response);
  const result = await data.json();
  return { tonedText: result.result };
};