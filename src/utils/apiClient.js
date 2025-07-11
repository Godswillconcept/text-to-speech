import axios from 'axios';

// Create axios instance with base config
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
// onUnauthenticated parameter is kept for future use
// eslint-disable-next-line no-unused-vars
const setupRequestInterceptor = (getToken, _onUnauthenticated) => {
  return apiClient.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Response interceptor to handle 401 responses
const setupResponseInterceptor = (onUnauthenticated) => {
  return apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is 401 and we haven't tried to get a new token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        onUnauthenticated();
      }
      
      return Promise.reject(error);
    }
  );
};

export { apiClient, setupRequestInterceptor, setupResponseInterceptor };
