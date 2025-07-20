const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Use the auth middleware
const { auth } = require('../middleware/auth');

const ttsController = require('../controllers/ttsController');
const { upload, handleUploadErrors } = require('../middleware/upload');

// @route   GET /api/tts/options
// @desc    Get available TTS options (languages, formats, codecs, etc.)
// @access  Public (no auth required for options)
router.get('/options', ttsController.getTtsOptions);

// @route   GET /api/tts/voices
// @desc    Get available TTS voices grouped by language
// @access  Public (no auth required for voices)
router.get('/voices', ttsController.getVoices);

// @route   POST /api/tts/text-to-speech
// @desc    Convert text to speech
// @access  Private (but supports optional auth for anonymous usage)
router.post(
  '/text-to-speech',
  auth, // Require authentication for TTS generation
  [
    check('text', 'Text is required').not().isEmpty(),
    check('voice', 'Voice is required').optional(),
    check('language', 'Language is required if voice is not specified').if(
      (value, { req }) => !req.body.voice
    ).notEmpty(),
    check('format', 'Invalid format').optional().isIn(
      require('../config/ttsConfig').audioFormats.map(f => f.code)
    ),
    check('codec', 'Invalid codec').optional().isIn(
      require('../config/ttsConfig').codecs
    ),
    check('speed', 'Speed must be between -10 and 10').optional().isInt({ min: -10, max: 10 }),
    check('base64', 'base64 must be a boolean').optional().isBoolean()
  ],
  ttsController.textToSpeech
);

// @route   POST /api/tts/pdf-to-speech
// @desc    Convert PDF to speech
// @access  Private
router.post(
  '/pdf-to-speech',
  [
    auth,
    (req, res, next) => {
      upload.single('file')(req, res, (err) => {
        if (err) {
          return handleUploadErrors(err, req, res, next);
        }
        next();
      });
    },
    check('voice', 'Voice is required').optional()
  ],
  ttsController.pdfToSpeech
);

// @route   GET /api/tts/history
// @desc    Get user's TTS history
// @access  Private
router.get('/history', auth, ttsController.getHistory);

// @route   GET /api/tts/audio/:id
// @desc    Get audio file by ID
// @access  Private
router.get('/audio/:id', auth, ttsController.getAudioById);

module.exports = router;