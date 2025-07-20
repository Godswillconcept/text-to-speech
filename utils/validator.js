const Joi = require('joi');
const { badRequest, unprocessableEntity } = require('./apiResponse');
const logger = require('./logger');

// Common validation patterns
const patterns = {
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^\+?[1-9]\d{1,14}$/, // E.164 format
  uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  objectId: /^[0-9a-fA-F]{24}$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
  base64: /^[A-Za-z0-9+/]+={0,2}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  ip: /^(\d{1,3}\.){3}\d{1,3}$/,
  domain: /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/
};

// Custom validation messages
const customMessages = {
  'string.empty': '{#label} is required',
  'any.required': '{#label} is required',
  'string.min': '{#label} must be at least {#limit} characters',
  'string.max': '{#label} must not exceed {#limit} characters',
  'string.email': 'Please provide a valid email address',
  'string.pattern.base': 'Please provide a valid {#label}',
  'string.base': '{#label} must be a string',
  'number.base': '{#label} must be a number',
  'boolean.base': '{#label} must be a boolean',
  'array.base': '{#label} must be an array',
  'object.base': '{#label} must be an object',
  'any.only': '{#label} must be one of {#valids}',
  'any.unknown': 'Unknown field: {#label}'
};

// Common validation schemas
const schemas = {
  // Authentication
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().label('Name'),
    email: Joi.string().email().required().label('Email'),
    password: Joi.string()
      .min(8)
      .pattern(patterns.password)
      .required()
      .label('Password')
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .label('Confirm Password')
      .messages({
        'any.only': 'Passwords do not match',
      }),
  }).options({ abortEarly: false }),

  login: Joi.object({
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().required().label('Password'),
    rememberMe: Joi.boolean().default(false).label('Remember Me')
  }).options({ abortEarly: false }),

  // User
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).label('Name'),
    email: Joi.string().email().label('Email'),
    phone: Joi.string().pattern(patterns.phone).allow('', null).label('Phone'),
    avatar: Joi.string().uri().allow('', null).label('Avatar URL')
  }).min(1).options({ abortEarly: false }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().label('Current Password'),
    newPassword: Joi.string()
      .min(8)
      .pattern(patterns.password)
      .required()
      .label('New Password')
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .label('Confirm New Password')
      .messages({
        'any.only': 'Passwords do not match',
      }),
  }).options({ abortEarly: false }),

  // Document
  uploadDocument: Joi.object({
    title: Joi.string().min(2).max(100).required().label('Title'),
    description: Joi.string().max(500).allow('', null).label('Description'),
    language: Joi.string().default('en-US').label('Language'),
    voice: Joi.string().default('en-US-LindaNeural').label('Voice'),
    isPublic: Joi.boolean().default(false).label('Public'),
  }).options({ abortEarly: false }),

  // Text-to-Speech
  textToSpeech: Joi.object({
    text: Joi.string().min(1).max(5000).required().label('Text'),
    language: Joi.string().default('en-US').label('Language'),
    voice: Joi.string().default('en-US-LindaNeural').label('Voice'),
    speed: Joi.number().min(0.5).max(2).default(1).label('Speed'),
    pitch: Joi.number().min(-20).max(20).default(0).label('Pitch'),
    format: Joi.string().valid('mp3', 'wav', 'ogg').default('mp3').label('Format'),
  }).options({ abortEarly: false }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().min(1).default(1).label('Page'),
    limit: Joi.number().min(1).max(100).default(10).label('Limit'),
    sort: Joi.string().default('-createdAt').label('Sort'),
    search: Joi.string().allow('').label('Search'),
    filter: Joi.object().pattern(/^\w+$/, Joi.alternatives().try(
      Joi.string(),
      Joi.number(),
      Joi.boolean(),
      Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))
    )).default({}).label('Filter')
  }).options({ abortEarly: false }),

  // ID params
  idParam: Joi.object({
    id: Joi.string().pattern(patterns.objectId).required().label('ID')
  }),

  // File upload
  fileUpload: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    buffer: Joi.binary()
  })
};

// Custom validation rules
const customValidators = {
  // Validate MongoDB ObjectId
  objectId: (value, helpers) => {
    if (!value.match(patterns.objectId)) {
      return helpers.error('any.invalid');
    }
    return value;
  },

  // Validate password strength
  password: (value, helpers) => {
    if (!value.match(patterns.password)) {
      return helpers.error('any.invalid');
    }
    return value;
  },

  // Validate file type
  fileType: (allowedTypes) => (value, helpers) => {
    if (!allowedTypes.includes(value.mimetype)) {
      return helpers.error('any.invalid');
    }
    return value;
  },

  // Validate file size
  fileSize: (maxSize) => (value, helpers) => {
    if (value.size > maxSize) {
      return helpers.error('any.invalid');
    }
    return value;
  }
};

// Validate request data against schema
const validate = (schema, data, options = {}) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: options.allowUnknown || false,
    stripUnknown: options.stripUnknown || true,
    messages: customMessages,
    ...options
  });

  if (error) {
    const errors = {};
    
    error.details.forEach((err) => {
      const key = err.path.join('.');
      
      if (!errors[key]) {
        errors[key] = err.message.replace(/["']/g, '');
      }
    });
    
    return { error: errors };
  }
  
  return { value };
};

// Express middleware for request validation
const validateRequest = (schema, options = {}) => {
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
    const { error, value } = validate(schema, data, options);
    
    if (error) {
      logger.warn('Validation failed', { 
        path: req.path, 
        method: req.method,
        errors: error 
      });
      
      return unprocessableEntity(res, 'Validation failed', error);
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

// Middleware to validate file uploads
const validateFileUpload = (fieldName, options = {}) => {
  return (req, res, next) => {
    if (!req.file) {
      return badRequest(res, `File '${fieldName}' is required`);
    }
    
    const { error } = validate(schemas.fileUpload, req.file, options);
    
    if (error) {
      // Clean up the uploaded file if validation fails
      if (req.file.path) {
        require('fs').unlinkSync(req.file.path);
      }
      
      return unprocessableEntity(res, 'File validation failed', error);
    }
    
    next();
  };
};

module.exports = {
  Joi,
  patterns,
  schemas,
  customValidators,
  validate,
  validateRequest,
  validateFileUpload
};
