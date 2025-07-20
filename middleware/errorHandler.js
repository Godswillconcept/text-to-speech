const { 
  badRequest, 
  unauthorized, 
  forbidden, 
  notFound, 
  conflict, 
  unprocessableEntity, 
  serverError, 
  serviceUnavailable,
  tooManyRequests
} = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // Ensure the error name is set to the class name
    this.name = this.constructor.name;
  }
}

// Specific error classes for different types of errors
class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = null) {
    super(message, 400, true);
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, true);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, true);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, true);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict occurred') {
    super(message, 409, true);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, true);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(service, message = 'Service unavailable') {
    super(`${message}: ${service}`, 503, true);
    this.service = service;
  }
}

// Map of error names to HTTP status codes
const errorStatusMap = {
  // JWT errors
  JsonWebTokenError: 401,
  TokenExpiredError: 401,
  NotBeforeError: 401,
  
  // Database errors (Sequelize)
  SequelizeValidationError: 400,
  SequelizeUniqueConstraintError: 409,
  SequelizeForeignKeyConstraintError: 400,
  SequelizeDatabaseError: 400,
  SequelizeConnectionError: 503,
  
  // File system errors
  ENOENT: 404, // File not found
  EACCES: 403, // Permission denied
  EEXIST: 409, // File already exists
  
  // Default
  default: 500
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous',
    ...(err.errors && { validationErrors: err.errors })
  });
  
  // Determine the status code
  let statusCode = err.statusCode || errorStatusMap[err.name] || errorStatusMap.default;
  let message = err.message || 'An unexpected error occurred';
  let errors = err.errors;
  
  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') {
    statusCode = 422; // Unprocessable Entity
    message = 'Validation failed';
    
    // Format validation errors
    if (err.errors) {
      errors = {};
      err.errors.forEach((error) => {
        const field = error.path || error.param || 'unknown';
        errors[field] = error.message || 'Invalid value';
      });
    }
  } else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    message = 'Token has expired';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    message = 'A record with this value already exists';
    
    if (err.errors && err.errors[0]) {
      const field = err.errors[0].path;
      message = `${field} is already in use`;
    }
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413; // Payload Too Large
    message = `File too large. Maximum size is ${(err.limit / (1024 * 1024)).toFixed(2)}MB`;
  } else if (err.code === 'ENOENT') {
    // File not found
    statusCode = 404;
    message = 'The requested resource was not found';
  } else if (err.code === 'EACCES') {
    // Permission denied
    statusCode = 403;
    message = 'Permission denied';
  } else if (err.code === 'EEXIST') {
    // File already exists
    statusCode = 409;
    message = 'File already exists';
  } else if (err.response) {
    // Handle errors from external services
    const { status, data } = err.response;
    statusCode = status || 502; // Bad Gateway by default
    message = data?.message || 'Error from external service';
  }
  
  // Send appropriate response based on environment
  if (process.env.NODE_ENV === 'development') {
    // In development, send detailed error information
    res.status(statusCode).json({
      success: false,
      message,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        ...(errors && { errors })
      }
    });
  } else {
    // In production, send minimal error information
    const response = {
      success: false,
      message
    };
    
    // Only include validation errors in production
    if (errors && statusCode === 422) {
      response.errors = errors;
    }
    
    res.status(statusCode).json(response);
  }
};

/**
 * 404 Not Found middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Async handler to wrap async/await route handlers
 * This eliminates the need for try/catch blocks in route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
