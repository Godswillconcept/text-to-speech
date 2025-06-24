const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Use the main auth middleware
const { auth } = require('../middleware/auth');

const ttsController = require('../controllers/ttsController');
const { upload, handleUploadErrors } = require('../middleware/upload');

// @route   POST /api/tts/text-to-speech
// @desc    Convert text to speech
// @access  Private
router.post(
  '/text-to-speech',
  [
    auth,
    check('text', 'Text is required').not().isEmpty(),
    check('voice', 'Voice is required').not().isEmpty()
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
      upload.single('pdf')(req, res, (err) => {
        if (err) {
          return handleUploadErrors(err, req, res, next);
        }
        next();
      });
    },
    check('voice', 'Voice is required').not().isEmpty()
  ],
  ttsController.pdfToSpeech
);

// @route   GET /api/tts/voices
// @desc    Get available voices
// @access  Private
router.get('/voices', auth, ttsController.getVoices);

// @route   GET /api/tts/history
// @desc    Get user's TTS history
// @access  Private
router.get('/history', auth, ttsController.getHistory);

// @route   GET /api/tts/audio/:id
// @desc    Get audio file by ID
// @access  Private
router.get('/audio/:id', auth, ttsController.getAudioById);

module.exports = router;
