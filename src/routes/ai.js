const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Use the main auth middleware
const { auth } = require('../middleware/auth');

const aiController = require('../controllers/aiController');
const { upload } = require('../middleware/upload');

// @route   POST /api/ai/paraphrase
// @desc    Paraphrase text
// @access  Private
router.post(
  '/paraphrase',
  [
    auth,
    check('text', 'Text is required').not().isEmpty(),
    check('tone', 'Tone must be a string').optional().isString(),
    check('complexity', 'Complexity must be one of: simplify, maintain, enhance').optional().isIn(['simplify', 'maintain', 'enhance'])
  ],
  aiController.paraphrase
);

// @route   POST /api/ai/summarize
// @desc    Summarize text
// @access  Private
router.post(
  '/summarize',
  [
    auth,
    check('text', 'Text is required').not().isEmpty(),
    check('format', 'Format must be one of: paragraph, bullet, concise').optional().isIn(['paragraph', 'bullet', 'concise']),
    check('length', 'Length must be a number between 1 and 5').optional().isInt({ min: 1, max: 5 })
  ],
  aiController.summarize
);

// @route   POST /api/ai/key-points
// @desc    Extract key points from text
// @access  Private
router.post(
  '/key-points',
  [
    auth,
    check('text', 'Text is required').not().isEmpty(),
    check('count', 'Count must be a positive number').optional().isInt({ min: 1, max: 20 })
  ],
  aiController.extractKeyPoints
);

// @route   POST /api/ai/change-tone
// @desc    Change tone of text
// @access  Private
router.post(
  '/change-tone',
  [
    auth,
    check('text', 'Text is required').not().isEmpty(),
    check('tone', 'Tone is required').not().isEmpty()
  ],
  aiController.changeTone
);

// @route   POST /api/ai/doc/paraphrase
// @desc    Paraphrase document text
// @access  Private
router.post(
  '/doc/paraphrase',
  [
    auth,
    upload.single('file'),
    check('file', 'File is required').exists(),
    check('tone', 'Tone must be a string').optional().isString(),
    check('complexity', 'Complexity must be one of: simplify, maintain, enhance').optional().isIn(['simplify', 'maintain', 'enhance'])
  ],
  aiController.paraphraseDocument
);

// @route   POST /api/ai/doc/summarize
// @desc    Summarize document text
// @access  Private
router.post(
  '/doc/summarize',
  [
    auth,
    upload.single('file'),
    check('file', 'File is required').exists(),
    check('format', 'Format must be one of: paragraph, bullet, concise').optional().isIn(['paragraph', 'bullet', 'concise']),
    check('length', 'Length must be a number between 1 and 5').optional().isInt({ min: 1, max: 5 })
  ],
  aiController.summarizeDocument
);

// @route   POST /api/ai/doc/key-points
// @desc    Extract key points from document
// @access  Private
router.post(
  '/doc/key-points',
  [
    auth,
    upload.single('file'),
    check('file', 'File is required').exists(),
    check('count', 'Count must be a positive number').optional().isInt({ min: 1, max: 20 })
  ],
  aiController.extractKeyPointsFromDocument
);

// @route   POST /api/ai/doc/change-tone
// @desc    Change tone of document text
// @access  Private
router.post(
  '/doc/change-tone',
  [
    auth,
    upload.single('file'),
    check('file', 'File is required').exists(),
    check('tone', 'Tone is required').not().isEmpty()
  ],
  aiController.changeToneOfDocument
);

// @route   GET /api/ai/history
// @desc    Get AI operation history
// @access  Private
router.get(
  '/history',
  [
    auth,
    check('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    check('limit', 'Limit must be a positive number').optional().isInt({ min: 1, max: 100 }),
    check('type', 'Invalid operation type').optional().isIn(['paraphrase', 'summarize', 'key-points', 'change-tone'])
  ],
  aiController.getHistory
);

module.exports = router;
