const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Use the main auth middleware
const { auth } = require('../middleware/auth');

const aiController = require('../controllers/aiController');

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
