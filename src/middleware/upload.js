const multer = require('multer');
const { ApiError } = require('./errorHandler');

// Use memory storage to get file buffer
const storage = multer.memoryStorage();

// File filter to only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
  }
};

// Configure multer with the storage and file filter
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  }
});

// Middleware to handle file upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size is too large. Maximum size is 10MB.'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError(400, 'Too many files. Only one file is allowed.'));
    }
    return next(new ApiError(400, 'File upload error: ' + err.message));
  } else if (err) {
    // An unknown error occurred
    return next(err);
  }
  next();
};

module.exports = { upload, handleUploadErrors };
