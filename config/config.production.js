module.exports = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Database Configuration
  database: {
    username: process.env.DB_USER || 'tts_user',
    password: process.env.DB_PASSWORD || 'your_secure_password',
    database: process.env.DB_NAME || 'tts_production',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },
  
  // VoiceRSS Configuration
  voiceRss: {
    apiKey: process.env.VOICE_RSS_API_KEY || 'your_voice_rss_api_key',
    apiUrl: process.env.VOICE_RSS_API_URL || 'http://api.voicerss.org/',
    codec: 'MP3',
    format: '44khz_16bit_stereo',
    language: 'en-us',
    voice: 'Linda',
    rate: 0, // -10 to 10
    pitch: 0 // -10 to 10
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
    origin: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: true,
      path: './logs/app.log',
      maxSize: '20m',
      maxFiles: '14d'
    }
  },
  
  // Security Headers
  security: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    },
    frameguard: {
      action: 'deny'
    },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    ieNoOpen: true
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your_session_secret_here',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  
  // API Documentation
  swagger: {
    route: '/api-docs',
    info: {
      title: 'Text-to-Speech API',
      version: '1.0.0',
      description: 'API documentation for the Text-to-Speech application'
    },
    schemes: ['http', 'https'],
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
      provider: 'sendgrid', // or 'nodemailer', 'mailgun', etc.
      apiKey: process.env.EMAIL_API_KEY || '',
      from: process.env.EMAIL_FROM || 'noreply@example.com'
    },
    storage: {
      provider: 'local', // or 's3', 'google-cloud-storage', etc.
      localPath: './storage',
      s3: {
        bucket: process.env.S3_BUCKET,
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    }
  }
};
