module.exports = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'text_to_speech_dev',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log, // Enable SQL query logging in development
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '30d' // Longer expiry for development
  },
  
  // VoiceRSS Configuration
  voiceRss: {
    apiKey: process.env.VOICE_RSS_API_KEY || '16390f10cfa5455da54c8d77ff7419bf',
    apiUrl: process.env.VOICE_RSS_API_URL || 'http://api.voicerss.org/',
    codec: 'MP3',
    format: '44khz_16bit_stereo',
    language: 'en-us',
    voice: 'Linda',
    rate: 0,
    pitch: 0
  },
  
  // File Upload Configuration
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ]
  },
  
  // CORS Configuration
  cors: {
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  
  // Rate Limiting (more lenient in development)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 // Higher limit for development
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: {
      enabled: true,
      path: './logs/app.log',
      maxSize: '50m',
      maxFiles: '7d'
    }
  },
  
  // Security Headers (less strict in development)
  security: {
    contentSecurityPolicy: false, // Disable in development for easier testing
    hsts: false,
    frameguard: false,
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    ieNoOpen: true
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Allow non-HTTPS in development
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  },
  
  // API Documentation
  swagger: {
    route: '/api-docs',
    info: {
      title: 'Text-to-Speech API (Development)',
      version: '1.0.0',
      description: 'Development API documentation for the Text-to-Speech application'
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    }
  },
  
  // Feature Flags
  features: {
    registration: true,
    emailVerification: false,
    passwordReset: true,
    rateLimiting: true,
    requestLogging: true,
    errorTracking: true
  },
  
  // External Services
  services: {
    email: {
      provider: 'mock', // Use mock email service in development
      apiKey: '',
      from: 'dev@example.com'
    },
    storage: {
      provider: 'local',
      localPath: './storage'
    }
  }
};
