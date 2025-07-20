const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('./logger');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

// Ensure upload directory exists
const ensureUploadsDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created uploads directory: ${dir}`);
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.upload.dir;
    ensureUploadsDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    const allowedMimeTypes = config.upload.allowedMimeTypes || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(`Invalid file type: ${file.mimetype}`);
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  } catch (error) {
    cb(error, false);
  }
};

// Initialize multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize || 10 * 1024 * 1024, // 10MB default
    files: 1
  }
});

// Middleware to handle file upload
const handleFileUpload = (fieldName) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);
    
    uploadSingle(req, res, (err) => {
      if (err) {
        logger.error('File upload error:', { error: err.message, code: err.code });
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File too large. Maximum size is ${config.upload.maxFileSize / (1024 * 1024)}MB`
          });
        }
        
        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: `Invalid file type. Allowed types: ${config.upload.allowedMimeTypes.join(', ')}`
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Error uploading file',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      
      next();
    });
  };
};

// Extract text from different file types
const extractTextFromFile = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let text = '';
    
    switch (ext) {
      case '.pdf':
        text = await extractTextFromPDF(filePath);
        break;
        
      case '.docx':
        text = await extractTextFromDocx(filePath);
        break;
        
      case '.doc':
        text = await extractTextFromDoc(filePath);
        break;
        
      case '.txt':
        text = await fs.promises.readFile(filePath, 'utf-8');
        break;
        
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
    
    return text.trim();
  } catch (error) {
    logger.error('Error extracting text from file:', { filePath, error: error.message });
    throw error;
  }
};

// Extract text from PDF using pdftotext
const extractTextFromPDF = async (filePath) => {
  try {
    const { stdout, stderr } = await execAsync(`pdftotext "${filePath}" -`);
    
    if (stderr) {
      logger.warn('PDF text extraction warnings:', stderr);
    }
    
    return stdout;
  } catch (error) {
    logger.error('Error extracting text from PDF:', { filePath, error: error.message });
    throw new Error('Failed to extract text from PDF. Make sure pdftotext is installed.');
  }
};

// Extract text from DOCX using textract
const extractTextFromDocx = async (filePath) => {
  try {
    const textract = require('textract');
    
    return new Promise((resolve, reject) => {
      textract.fromFileWithPath(filePath, (error, text) => {
        if (error) {
          reject(error);
        } else {
          resolve(text);
        }
      });
    });
  } catch (error) {
    logger.error('Error extracting text from DOCX:', { filePath, error: error.message });
    throw new Error('Failed to extract text from DOCX. Make sure textract is properly configured.');
  }
};

// Extract text from DOC using catdoc
const extractTextFromDoc = async (filePath) => {
  try {
    const { stdout, stderr } = await execAsync(`catdoc "${filePath}"`);
    
    if (stderr) {
      logger.warn('DOC text extraction warnings:', stderr);
    }
    
    return stdout;
  } catch (error) {
    logger.error('Error extracting text from DOC:', { filePath, error: error.message });
    throw new Error('Failed to extract text from DOC. Make sure catdoc is installed.');
  }
};

// Generate a unique filename with extension
const generateUniqueFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  return `${uuidv4()}${ext}`;
};

// Delete a file
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error('Error deleting file:', { filePath, error: err.message });
        reject(err);
      } else {
        logger.info('File deleted successfully:', filePath);
        resolve();
      }
    });
  });
};

// Clean up old files in a directory
const cleanupOldFiles = async (directory, maxAgeMs = 7 * 24 * 60 * 60 * 1000) => {
  try {
    const files = await fs.promises.readdir(directory);
    const now = Date.now();
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.promises.stat(filePath);
      
      if (now - stats.mtimeMs > maxAgeMs) {
        await deleteFile(filePath);
        deletedCount++;
      }
    }
    
    logger.info(`Cleaned up ${deletedCount} old files from ${directory}`);
    return deletedCount;
  } catch (error) {
    logger.error('Error cleaning up old files:', { directory, error: error.message });
    throw error;
  }
};

// Schedule regular cleanup of old files
const scheduleCleanup = (intervalMs = 24 * 60 * 60 * 1000) => {
  setInterval(() => {
    cleanupOldFiles(config.upload.dir)
      .catch(err => logger.error('Scheduled cleanup failed:', err));
  }, intervalMs);
  
  logger.info(`Scheduled file cleanup every ${intervalMs / (60 * 60 * 1000)} hours`);
};

module.exports = {
  upload,
  handleFileUpload,
  extractTextFromFile,
  generateUniqueFilename,
  deleteFile,
  cleanupOldFiles,
  scheduleCleanup
};
