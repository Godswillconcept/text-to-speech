const fs = require('fs');
const path = require('path');

// Determine the environment
const env = process.env.NODE_ENV || 'development';

// Load the appropriate config file
let config;
try {
  // Try to load the environment-specific config
  config = require(`./config.${env}`);
  
  // If we're in production, validate required environment variables
  if (env === 'production') {
    const requiredVars = [
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET',
      'VOICE_RSS_API_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      process.exit(1);
    }
  }
} catch (error) {
  console.error(`Error loading config for environment: ${env}`, error);
  process.exit(1);
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

module.exports = config;
