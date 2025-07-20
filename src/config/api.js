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

export { API_BASE_URL };
