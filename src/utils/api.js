const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
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
export const textToSpeech = async (options) => { // Expects { text, voice, rate, pitch }
  const response = await fetch(`${API_BASE_URL}/text-to-speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  await handleResponse(response);
  return response.blob();
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
  const response = await fetch(`${API_BASE_URL}/paraphrase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  await handleResponse(response);
  return response.json();
};

// Function for text summarization
export const summarizeText = async (options) => { // Expects { text }
  const response = await fetch(`${API_BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  await handleResponse(response);
  return response.json();
};

// Function to get all operations
export const getOperations = async () => {
  const response = await fetch(`${API_BASE_URL}/operations`);
  await handleResponse(response);
  return response.json();
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
 * @returns {Promise<object>} The summary result.
 */
export const summarizePdf = async (formData) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUMMARIZE_PDF}`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(response);
  return response.json();
};

/**
 * Paraphrases the text content of an uploaded PDF file.
 * @param {FormData} formData - The form data containing the PDF file.
 * @returns {Promise<object>} The paraphrased text result.
 */
export const paraphrasePdf = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/paraphrase-pdf`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(response);
  return response.json();
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
 * @returns {Promise<{tonedText: string}>} An object containing the text with the new tone.
 */
export const changeToneOfText = async (options) => {
  const response = await fetch(`${API_BASE_URL}/change-tone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  await handleResponse(response);
  return response.json();
};

/**
 * Changes the tone of an uploaded PDF file's content.
 * @param {FormData} formData - The form data containing the PDF file and tone.
 * @returns {Promise<{tonedText: string}>} An object containing the text with the new tone.
 */
export const changeToneOfPdf = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/change-tone-pdf`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(response);
  return response.json();
};