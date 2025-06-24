const path = require('path');
const fs = require('fs').promises;
const Operation = require('../models/Operation');
const { paraphraseText, summarizeText, extractKeyPoints, changeTone } = require('../services/aiService');
const { saveFile, extractText, cleanup, getUploadDir, getDocumentDirs } = require('../services/documentService');
const { ApiError } = require('../middleware/errorHandler');
const pdfService = require('../services/pdfService');

/**
 * @desc    Paraphrase text
 * @route   POST /api/ai/paraphrase
 * @access  Private
 */
exports.paraphrase = async (req, res, next) => {
  try {
    const { text, tone = 'neutral', complexity = 'maintain' } = req.body;
    const userId = req.user.id;

    if (!text) {
      throw new ApiError(400, 'Text is required');
    }

    // Create operation record
    const operation = await Operation.create({
      type: 'paraphrase',
      input: text,
      status: 'pending',
      userId,
      metadata: {
        tone,
        complexity,
        inputLength: text.length
      }
    });

    try {
      // Paraphrase the text
      const result = await paraphraseText(text, { tone, complexity });

      // Update operation status
      await operation.update({
        status: 'completed',
        output: result,
        metadata: {
          ...operation.metadata,
          outputLength: result.length
        }
      });

      // Return the result
      res.json({
        success: true,
        result,
        operationId: operation.id
      });
    } catch (error) {
      console.error('Paraphrase Error:', error);
      await operation.update({
        status: 'failed',
        output: error.message
      });
      throw new ApiError(500, 'Failed to paraphrase text');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Summarize text
 * @route   POST /api/ai/summarize
 * @access  Private
 */
exports.summarize = async (req, res, next) => {
  try {
    const { text, format = 'paragraph', length = 3 } = req.body;
    const userId = req.user.id;

    if (!text) {
      throw new ApiError(400, 'Text is required');
    }

    // Create operation record
    const operation = await Operation.create({
      type: 'summarize',
      input: text,
      status: 'pending',
      userId,
      metadata: {
        format,
        length,
        inputLength: text.length
      }
    });

    try {
      // Summarize the text
      const result = await summarizeText(text, { format, length });

      // Update operation status
      await operation.update({
        status: 'completed',
        output: result,
        metadata: {
          ...operation.metadata,
          outputLength: result.length
        }
      });

      // Return the result
      res.json({
        success: true,
        result,
        operationId: operation.id
      });
    } catch (error) {
      console.error('Summarize Error:', error);
      await operation.update({
        status: 'failed',
        output: error.message
      });
      throw new ApiError(500, 'Failed to summarize text');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Extract key points from text
 * @route   POST /api/ai/key-points
 * @access  Private
 */
exports.extractKeyPoints = async (req, res, next) => {
  try {
    const { text, count = 5 } = req.body;
    const userId = req.user.id;

    if (!text) {
      throw new ApiError(400, 'Text is required');
    }

    // Create operation record
    const operation = await Operation.create({
      type: 'key-points',
      input: text,
      status: 'pending',
      userId,
      metadata: {
        count,
        inputLength: text.length
      }
    });

    try {
      // Extract key points
      const keyPoints = await extractKeyPoints(text, { count });

      // Update operation status
      await operation.update({
        status: 'completed',
        output: JSON.stringify(keyPoints),
        metadata: {
          ...operation.metadata,
          pointsExtracted: keyPoints.length
        }
      });

      // Return the result
      res.json({
        success: true,
        keyPoints,
        operationId: operation.id
      });
    } catch (error) {
      console.error('Key Points Extraction Error:', error);
      await operation.update({
        status: 'failed',
        output: error.message
      });
      throw new ApiError(500, 'Failed to extract key points');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change tone of text
 * @route   POST /api/ai/change-tone
 * @access  Private
 */
exports.changeTone = async (req, res, next) => {
  try {
    const { text, tone } = req.body;
    const userId = req.user.id;

    if (!text) {
      throw new ApiError(400, 'Text is required');
    }

    if (!tone) {
      throw new ApiError(400, 'Tone is required');
    }

    // Create operation record
    const operation = await Operation.create({
      type: 'change-tone',
      input: text,
      status: 'pending',
      userId,
      metadata: {
        tone,
        inputLength: text.length
      }
    });

    try {
      // Change tone of the text
      const result = await changeTone(text, tone);

      // Update operation status
      await operation.update({
        status: 'completed',
        output: result,
        metadata: {
          ...operation.metadata,
          outputLength: result.length
        }
      });

      // Return the result
      res.json({
        success: true,
        result,
        operationId: operation.id
      });
    } catch (error) {
      console.error('Change Tone Error:', error);
      await operation.update({
        status: 'failed',
        output: error.message
      });
      throw new ApiError(500, 'Failed to change text tone');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI operation history
 * @route   GET /api/ai/history
 * @access  Private
 */
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = req.query.type; // Optional filter by operation type

    const where = { 
      userId,
      type: ['paraphrase', 'summarize', 'key-points', 'change-tone']
    };

    if (type) {
      where.type = type;
    }

    const { count, rows: operations } = await Operation.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'type', 'input', 'output', 'status', 'createdAt', 'metadata']
    });

    res.json({
      success: true,
      data: operations,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Process document and apply the specified AI operation
 * @private
 */
const processDocumentWithOperation = async (req, res, next, operationType, processFn) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const { originalname, mimetype, size, buffer } = req.file;
    
    // Save the uploaded file
    // Create file info object with the buffer from multer
    const fileInfo = {
      originalname,
      mimetype,
      size,
      buffer // Include the file buffer from multer
    };

    // Save file to appropriate directory
    const savedFile = await saveFile(fileInfo);
    
    try {
      // Extract text from the document
      const extractedText = await extractText({
        path: savedFile.path,
        mimetype: fileInfo.mimetype
      });
      
      if (!extractedText) {
        throw new ApiError(400, 'Could not extract text from the document');
      }

      // Process the text with the provided operation function
      const result = await processFn(extractedText, req.body);
      
      // Convert array output to string if needed (e.g., for key points)
      const outputText = Array.isArray(result) ? result.join('\n\n') : result;

      // Generate PDF version
      const pdfFileName = `${path.basename(savedFile.path, path.extname(savedFile.path))}.pdf`;
      const pdfPath = path.join('outputs', pdfFileName);
      await fs.mkdir('outputs', { recursive: true });
      await pdfService.generatePdf(outputText, pdfPath);

      // Create operation record
      const operationRecord = await Operation.create({
        type: `document-${operationType}`,
        input: extractedText,
        output: outputText, // Use the string version of the result
        status: 'completed',
        userId: req.user.id,
        metadata: {
          originalFileName: originalname,
          fileType: fileInfo.mimetype,
          fileSize: size,
          pdfOutputPath: pdfPath,
          ...req.body // Include any additional metadata from the request
        }
      });

      // Return results
      res.json({
        success: true,
        text: result,
        pdfUrl: `/outputs/${pdfFileName}`,
        operationId: operationRecord.id
      });

    } finally {
      // Clean up the uploaded file
      await cleanup(savedFile.path);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Paraphrase document text
 * @route   POST /api/ai/doc/paraphrase
 * @access  Private
 */
exports.paraphraseDocument = async (req, res, next) => {
  await processDocumentWithOperation(req, res, next, 'paraphrase', 
    async (text, options) => await paraphraseText(text, options)
  );
};

/**
 * @desc    Summarize document text
 * @route   POST /api/ai/doc/summarize
 * @access  Private
 */
exports.summarizeDocument = async (req, res, next) => {
  await processDocumentWithOperation(req, res, next, 'summarize', 
    async (text, options) => await summarizeText(text, options)
  );
};

/**
 * @desc    Extract key points from document
 * @route   POST /api/ai/doc/key-points
 * @access  Private
 */
exports.extractKeyPointsFromDocument = async (req, res, next) => {
  await processDocumentWithOperation(req, res, next, 'key-points', 
    async (text, options) => await extractKeyPoints(text, options)
  );
};

/**
 * @desc    Change tone of document text
 * @route   POST /api/ai/doc/change-tone
 * @access  Private
 */
exports.changeToneOfDocument = async (req, res, next) => {
  await processDocumentWithOperation(req, res, next, 'change-tone', 
    async (text, options) => {
      const { tone = 'neutral' } = options || {};
      return await changeTone(text, tone);
    }
  );
};