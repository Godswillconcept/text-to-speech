const logger = require('./logger');

/**
 * Standard API response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {Object} data - Response data (optional)
 * @param {Object} meta - Additional metadata (pagination, etc.)
 * @param {Object} errors - Error details (for error responses)
 */
const apiResponse = (res, {
  statusCode = 200,
  message = 'Success',
  data = null,
  meta = null,
  errors = null
}) => {
  // Log error responses (4xx and 5xx)
  if (statusCode >= 400) {
    logger.error(`API Error: ${message}`, {
      statusCode,
      errors,
      stack: new Error().stack
    });
  }

  // Construct response object
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data && { data }),
    ...(meta && { meta }),
    ...(errors && { errors })
  };

  // Set status and send response
  return res.status(statusCode).json(response);
};

// Success responses
const success = (res, data, message = 'Success', meta = null) => {
  return apiResponse(res, {
    statusCode: 200,
    message,
    data,
    meta
  });
};

// Created response (201)
const created = (res, data, message = 'Resource created successfully') => {
  return apiResponse(res, {
    statusCode: 201,
    message,
    data
  });
};

// No content response (204)
const noContent = (res) => {
  return res.status(204).end();
};

// Bad request (400)
const badRequest = (res, message = 'Bad Request', errors = null) => {
  return apiResponse(res, {
    statusCode: 400,
    message,
    errors
  });
};

// Unauthorized (401)
const unauthorized = (res, message = 'Unauthorized') => {
  return apiResponse(res, {
    statusCode: 401,
    message
  });
};

// Forbidden (403)
const forbidden = (res, message = 'Forbidden') => {
  return apiResponse(res, {
    statusCode: 403,
    message
  });
};

// Not found (404)
const notFound = (res, message = 'Resource not found') => {
  return apiResponse(res, {
    statusCode: 404,
    message
  });
};

// Conflict (409)
const conflict = (res, message = 'Conflict', errors = null) => {
  return apiResponse(res, {
    statusCode: 409,
    message,
    errors
  });
};

// Unprocessable Entity (422)
const unprocessableEntity = (res, message = 'Validation failed', errors = null) => {
  return apiResponse(res, {
    statusCode: 422,
    message,
    errors
  });
};

// Internal server error (500)
const serverError = (res, message = 'Internal Server Error', error = null) => {
  // Log the actual error for debugging
  if (error) {
    logger.error('Server Error:', error);
  }

  return apiResponse(res, {
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.' 
      : message,
    ...(process.env.NODE_ENV !== 'production' && error && { error: error.message })
  });
};

// Service unavailable (503)
const serviceUnavailable = (res, message = 'Service Unavailable') => {
  return apiResponse(res, {
    statusCode: 503,
    message
  });
};

// Rate limited (429)
const tooManyRequests = (res, message = 'Too Many Requests') => {
  return apiResponse(res, {
    statusCode: 429,
    message
  });
};

// Export all response helpers
module.exports = {
  // Base response
  apiResponse,
  
  // Success responses
  success,
  created,
  noContent,
  
  // Client error responses
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessableEntity,
  tooManyRequests,
  
  // Server error responses
  serverError,
  serviceUnavailable
};
