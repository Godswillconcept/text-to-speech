// Import API_BASE_URL from config
import { API_BASE_URL } from '../config/api';
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
    let errorMessage = 'An unknown error occurred.';
    
    try {
      // Try to parse the error response as JSON
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (error) { // eslint-disable-line no-unused-vars
      // If JSON parsing fails, use a generic message based on status code
      switch (response.status) {
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        case 500:
          errorMessage = 'An internal server error occurred. Please try again later.';
          break;
        case 401:
          errorMessage = 'Session expired. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        default:
          errorMessage = `Request failed with status ${response.status}`;
      }
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
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
    
    // Fix the URL to use the correct API endpoint
    xhr.open('POST', `${API_BASE_URL}/api/tts/pdf-to-speech`, true);
    
    // Add authorization header
    const token = localStorage.getItem('authToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event);
      }
    };
    
    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Check if the response is JSON (success case with audio URL) or binary (direct audio)
        const contentType = xhr.getResponseHeader('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // This is a JSON response with audio URL
          try {
            // Since responseType is 'blob', we need to convert blob to text first
            const blob = xhr.response;
            const responseText = await blob.text();
            const jsonResponse = JSON.parse(responseText);
            console.log('PDF to Speech JSON Response:', jsonResponse);
            
            if (jsonResponse.success) {
              // If we have a direct URL, use it (it's already a full URL)
              const audioUrl = jsonResponse.url || 
                // Otherwise construct the URL properly
                (jsonResponse.audioUrl ? 
                  `${API_BASE_URL.replace(/\/+$/, '')}${jsonResponse.audioUrl.startsWith('/') ? '' : '/'}${jsonResponse.audioUrl}` : 
                  '');
              
              if (!audioUrl) {
                throw new Error('No audio URL provided in the response');
              }
              
              console.log('Fetching audio from URL:', audioUrl);
              const audioResponse = await fetch(audioUrl, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                credentials: 'include' // Important for cookies/sessions if using them
              });
              
              if (audioResponse.ok) {
                const audioBlob = await audioResponse.blob();
                if (!audioBlob || audioBlob.size === 0) {
                  throw new Error('Received empty audio file');
                }
                console.log('Successfully fetched audio blob, size:', audioBlob.size, 'type:', audioBlob.type);
                resolve(audioBlob);
              } else {
                const errorText = await audioResponse.text();
                console.error('Failed to fetch audio file. Status:', audioResponse.status, 'Response:', errorText);
                throw new Error(`Failed to fetch audio file: ${audioResponse.status} ${audioResponse.statusText}`);
              }
            } else {
              reject(new Error(jsonResponse.message || 'Server did not return audio URL'));
            }
          } catch (e) {
            console.error('Failed to parse JSON response:', e);
            reject(new Error('Failed to parse server response'));
          }
        } else {
          // This is binary data (direct audio file)
          const blob = xhr.response;
          resolve(blob);
        }
      } else {
        const error = new Error(`Request failed with status ${xhr.status}`);
        try {
          // Try to parse error response
          const blob = xhr.response;
          const responseText = await blob.text();
          const errorData = JSON.parse(responseText);
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
/**
 * Fetches a single operation by ID
 * @param {string|number} id - The ID of the operation to fetch
 * @returns {Promise<Object>} The operation data
 */
export const getOperation = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/operations/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    });

    const validatedResponse = await handleResponse(response);
    return validatedResponse.json();
  } catch (error) {
    console.error('Error fetching operation:', error);
    throw error;
  }
};

/**
 * Fetches operations with pagination and filtering
 * @param {Object} options - Options for fetching operations
 * @param {number} options.page - Page number (1-based)
 * @param {number} options.limit - Number of items per page
 * @param {string} options.type - Filter by operation type
 * @param {string} options.search - Search term to filter operations
 * @returns {Promise<Object>} Paginated operations data
 */
export const getOperations = async ({ page = 1, limit = 10, type, search } = {}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (type) params.append('type', type);
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/api/operations?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    });

    const validatedResponse = await handleResponse(response);
    return validatedResponse.json();
  } catch (error) {
    console.error('Error fetching operations:', error);
    throw error;
  }
};

// Function to delete an operation
export const deleteOperation = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/operations/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
  });
  
  const validatedResponse = await handleResponse(response);
  
  // For DELETE operations, the response might be empty or just a success message
  // Check if there's content to parse
  const contentType = validatedResponse.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return validatedResponse.json();
  }
  
  // Return a success indicator if no JSON content
  return { success: true };
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
 * @param {object} options - Contains the text to process. e.g., { text, count? }
 * @returns {Promise<{keyPoints: string[]}>} An object containing an array of key points.
 */
export const getKeyPointsFromText = async (options) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/key-points`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: options.text,
      count: options.count || 5 // Default to 5 key points if not specified
    }),
  });
  
  const data = await handleResponse(response);
  const result = await data.json();
  
  // Return the keyPoints array from the response
  if (result && result.keyPoints && Array.isArray(result.keyPoints)) {
    // Filter out the first item if it's just an introductory sentence
    const filteredKeyPoints = result.keyPoints.filter((point, index) => 
      index > 0 || !point.toLowerCase().includes('here are')
    );
    return { keyPoints: filteredKeyPoints };
  }
  
  throw new Error('Invalid response format from server');
};

/**
 * Extracts key points from an uploaded PDF file.
 * @param {FormData} formData - The form data containing the PDF file.
 * @returns {Promise<{keyPoints: string[]}>} An object containing an array of key points.
 */
export const getKeyPointsFromPdf = async (formData) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/doc/key-points`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  
  const data = await handleResponse(response);
  const result = await data.json();
  
  // Handle the PDF response format where key points are in the 'text' field
  if (result && result.text && Array.isArray(result.text)) {
    // Filter out the first item if it's just an introductory sentence
    const filteredKeyPoints = result.text.filter((point, index) => 
      index > 0 || !point.toLowerCase().includes('here are')
    );
    
    return { 
      keyPoints: filteredKeyPoints,
      pdfUrl: result.pdfUrl || null,
      operationId: result.operationId || null
    };
  }
  
  // Fallback to check for keyPoints in case the response format changes
  if (result && result.keyPoints && Array.isArray(result.keyPoints)) {
    const filteredKeyPoints = result.keyPoints.filter((point, index) => 
      index > 0 || !point.toLowerCase().includes('here are')
    );
    return { 
      keyPoints: filteredKeyPoints,
      pdfUrl: result.pdfUrl || null,
      operationId: result.operationId || null
    };
  }
  
  throw new Error('Invalid response format from server');
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
  
  // handleResponse will parse the JSON and handle errors
  const result = await handleResponse(response);
  
  // The API returns the text in different fields depending on the endpoint
  // For text input, it's in 'result' or 'tonedText' field
  return { 
    text: result.result || result.tonedText || result.text,
    ...result // Include all other fields in case they're needed
  };
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
  
  // handleResponse will parse the JSON and handle errors
  const validatedResponse = await handleResponse(response);
  const result = await validatedResponse.json();
  
  // The API returns the text in different fields depending on the endpoint
  // For document uploads, it's in 'text' or 'result' field
  return { 
    text: result.text || result.result || result.tonedText,
    ...result // Include all other fields in case they're needed
  };
};