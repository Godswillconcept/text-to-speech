const Operation = require('../models/Operation');
const { paraphraseText, summarizeText, extractKeyPoints, changeTone } = require('../services/aiService');
const { ApiError } = require('../middleware/errorHandler');

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
