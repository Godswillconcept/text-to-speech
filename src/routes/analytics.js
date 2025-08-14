const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

/**
 * @route   GET /api/analytics/usage
 * @desc    Get usage analytics for the authenticated user
 * @access  Private
 */
router.get('/usage', auth, analyticsController.getUsageAnalytics);

/**
 * @route   GET /api/analytics/operations
 * @desc    Get paginated operations for the data table
 * @access  Private
 */
router.get('/operations', auth, analyticsController.getOperations);

module.exports = router;
