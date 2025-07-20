const winston = require('winston');
const path = require('path');
const config = require('../config');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
  // Add metadata if it exists and not empty
  if (Object.keys(meta).length > 0) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }
  
  return log;
});

// Define different formats for console and file
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.splat(),
  format.errors({ stack: true }),
  logFormat
);

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.splat(),
  format.errors({ stack: true }),
  logFormat
);

// Create logger instance
const logger = createLogger({
  level: config.logging?.level || 'info',
  format: fileFormat,
  defaultMeta: { service: 'tts-api' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: config.logging?.file?.maxSize || '20m',
      maxFiles: config.logging?.file?.maxFiles || '14d'
    }),
    // Write all logs with level 'info' and below to 'combined.log'
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: config.logging?.file?.maxSize || '20m',
      maxFiles: config.logging?.file?.maxFiles || '14d'
    })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: consoleFormat
  }));
}

// Add a stream for morgan (HTTP request logging)
logger.stream = {
  write: (message) => {
    // Remove extra newline at the end
    logger.http(message.trim());
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Optionally exit the process if you want to restart on uncaught exceptions
  // process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally exit the process if you want to restart on unhandled rejections
  // process.exit(1);
});

// Add request logging middleware
export const requestLogger = (req, res, next) => {
  // Skip health check logs to reduce noise
  if (req.path === '/health') return next();
  
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

// Add error logging middleware
export const errorLogger = (error, req, res, next) => {
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    ...(req.user && { userId: req.user.id })
  });
  
  next(error);
};

// Add logging for process events
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Log process info on startup
logger.info('Logger initialized', {
  nodeEnv: process.env.NODE_ENV || 'development',
  pid: process.pid,
  platform: process.platform,
  nodeVersion: process.version
});

module.exports = logger;
