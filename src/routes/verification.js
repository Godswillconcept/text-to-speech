const express = require('express');
const router = express.Router();
const { 
  sendVerification, 
  verifyEmail, 
  getVerificationStatus 
} = require('../controllers/verificationController');
const { auth } = require('../middleware/auth');

// @route   POST /api/verification/send
// @desc    Send verification email
// @access  Public
router.post('/send', auth, sendVerification);

// @route   POST /api/verification/verify
// @desc    Verify email with code
// @access  Public
router.post('/verify', verifyEmail);

// @route   GET /api/verification/status/:userId
// @desc    Get verification status for a user
// @access  Private
router.get('/status/:userId', auth, getVerificationStatus);

module.exports = router;
