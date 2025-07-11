const express = require('express');
const router = express.Router();
const { check, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  getOperations,
  getOperation,
  createOperation,
  updateOperation,
  deleteOperation
} = require('../controllers/operationController');

// Apply auth middleware to all routes
router.use(auth);

/**
 * @route   GET /api/operations
 * @desc    Get all operations for authenticated user
 * @access  Private
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn([
    'text-to-speech', 'pdf-to-speech', 'paraphrase', 'summarize', 
    'key-points', 'change-tone', 'document-paraphrase', 
    'document-summarize', 'document-key-points', 'document-change-tone'
  ]).withMessage('Invalid operation type'),
  query('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date')
], getOperations);

/**
 * @route   POST /api/operations
 * @desc    Create a new operation
 * @access  Private
 */
router.post('/', [
  check('type')
    .notEmpty()
    .withMessage('Operation type is required')
    .isIn([
      'text-to-speech', 'pdf-to-speech', 'paraphrase', 'summarize', 
      'key-points', 'change-tone', 'document-paraphrase', 
      'document-summarize', 'document-key-points', 'document-change-tone'
    ])
    .withMessage('Invalid operation type'),
  check('input')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Input text cannot exceed 10000 characters'),
  check('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
], createOperation);

/**
 * @route   GET /api/operations/:id
 * @desc    Get a single operation by ID
 * @access  Private
 */
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('Operation ID must be a positive integer')
], getOperation);

/**
 * @route   PATCH /api/operations/:id
 * @desc    Update an operation
 * @access  Private
 */
router.patch('/:id', [
  param('id').isInt({ min: 1 }).withMessage('Operation ID must be a positive integer'),
  check('status')
    .optional()
    .isIn(['pending', 'completed', 'failed'])
    .withMessage('Status must be one of: pending, completed, failed'),
  check('output')
    .optional()
    .isLength({ max: 50000 })
    .withMessage('Output cannot exceed 50000 characters'),
  check('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
], updateOperation);

/**
 * @route   DELETE /api/operations/:id
 * @desc    Delete an operation
 * @access  Private
 */
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('Operation ID must be a positive integer')
], deleteOperation);

module.exports = router;