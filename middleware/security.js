const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Configure CORS middleware
 */
const configureCors = () => {
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = Array.isArray(config.cors.origin) 
        ? config.cors.origin 
        : [config.cors.origin];
      
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: config.cors.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: config.cors.allowedHeaders || ['Content-Type', 'Authorization'],
    exposedHeaders: config.cors.exposedHeaders || [],
    credentials: config.cors.credentials || false,
    maxAge: config.cors.maxAge || 600, // 10 minutes
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
  
  return cors(corsOptions);
};

/**
 * Configure security headers using helmet
 */
const configureHelmet = () => {
  const helmetConfig = {
    contentSecurityPolicy: config.security?.contentSecurityPolicy || false,
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: config.security?.frameguard || { action: 'deny' },
    hidePoweredBy: config.security?.hidePoweredBy !== false,
    hsts: config.security?.hsts || { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: config.security?.ieNoOpen !== false,
    noSniff: config.security?.noSniff !== false,
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: config.security?.xssFilter !== false
  };
  
  return helmet(helmetConfig);
};

/**
 * Configure rate limiting
 */
const configureRateLimit = () => {
  const windowMs = config.rateLimit?.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = config.rateLimit?.max || 100; // Limit each IP to 100 requests per windowMs
  
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { 
      success: false, 
      message: 'Too many requests, please try again later.' 
    },
    keyGenerator: (req) => {
      // Use the client's IP address as the key
      return req.ip;
    },
    handler: (req, res, next, options) => {
      logger.warn('Rate limit exceeded', { 
        ip: req.ip, 
        path: req.path,
        method: req.method
      });
      
      res.status(options.statusCode).json(options.message);
    }
  });
};

/**
 * Prevent HTTP Parameter Pollution
 */
const preventParameterPollution = (req, res, next) => {
  // Check for duplicate query parameters
  if (Object.keys(req.query).length !== new URLSearchParams(req.originalUrl.split('?')[1] || '').size) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate query parameters are not allowed'
    });
  }
  
  // Check for duplicate body parameters (for url-encoded and JSON)
  if (req.is('application/x-www-form-urlencoded') || req.is('application/json')) {
    const bodyKeys = Object.keys(req.body);
    const uniqueBodyKeys = new Set(bodyKeys);
    
    if (bodyKeys.length !== uniqueBodyKeys.size) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate parameters in request body are not allowed'
      });
    }
  }
  
  next();
};

/**
 * Request validation middleware
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    // Get data to validate based on HTTP method
    let data;
    
    switch (req.method) {
      case 'GET':
        data = req.query;
        break;
      case 'POST':
      case 'PUT':
      case 'PATCH':
        data = req.body;
        break;
      case 'DELETE':
        data = { ...req.params, ...req.query };
        break;
      default:
        data = {};
    }
    
    // Add route params to data if needed
    if (req.params && Object.keys(req.params).length > 0) {
      data = { ...data, ...req.params };
    }
    
    // Validate the data
    const { error, value } = require('../utils/validator').validate(schema, data);
    
    if (error) {
      logger.warn('Request validation failed', { 
        path: req.path, 
        method: req.method,
        errors: error 
      });
      
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error
      });
    }
    
    // Replace request data with validated data
    switch (req.method) {
      case 'GET':
        req.query = value;
        break;
      case 'POST':
      case 'PUT':
      case 'PATCH':
        req.body = value;
        break;
      default:
        // For other methods, we don't modify the request
        break;
    }
    
    next();
  };
};

/**
 * Log all requests
 */
const requestLogger = (req, res, next) => {
  // Skip health check and static files
  if (req.path === '/health' || req.path.startsWith('/static/')) {
    return next();
  }
  
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip, user } = req;
    const { statusCode } = res;
    const contentLength = res.get('content-length') || 0;
    
    const logMeta = {
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      ip,
      contentLength: `${contentLength} bytes`,
      ...(user && { userId: user.id || 'anonymous' })
    };
    
    if (statusCode >= 400) {
      logger.error(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, logMeta);
    } else {
      logger.http(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, logMeta);
    }
  });
  
  next();
};

module.exports = {
  configureCors,
  configureHelmet,
  configureRateLimit,
  preventParameterPollution,
  validateRequest,
  requestLogger
};
